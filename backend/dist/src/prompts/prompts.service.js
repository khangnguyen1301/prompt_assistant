"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const generative_ai_1 = require("@google/generative-ai");
let PromptsService = class PromptsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
    async generateOptimizedPrompt(data, userId) {
        try {
            if (!data.userInput?.trim()) {
                throw new common_1.BadRequestException("User input is required");
            }
            let conversationContext = "";
            if (data.conversationId) {
                const conversation = await this.prisma.conversation.findUnique({
                    where: { id: data.conversationId },
                    include: {
                        messages: {
                            orderBy: { createdAt: "desc" },
                            take: 5,
                        },
                    },
                });
                if (conversation && conversation.userId === userId) {
                    conversationContext = conversation.messages
                        .reverse()
                        .map((msg) => `${msg.role}: ${msg.content}`)
                        .join("\n");
                }
            }
            const systemPrompt = this.createSystemPrompt(data.options);
            const userPrompt = this.createUserPrompt(data.userInput, conversationContext, data.options);
            const startTime = Date.now();
            const result = await this.model.generateContent([
                systemPrompt,
                userPrompt,
            ]);
            const processingTime = Date.now() - startTime;
            const response = await result.response;
            const optimizedPromptText = response.text();
            const structuredPrompt = this.parseStructuredPrompt(optimizedPromptText);
            const savedPrompt = await this.prisma.prompt.create({
                data: {
                    userId,
                    originalInput: data.userInput,
                    structuredPrompt: structuredPrompt,
                    metadata: {
                        processingTime,
                        options: data.options,
                        conversationId: data.conversationId,
                        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
                    },
                },
            });
            return {
                id: savedPrompt.id,
                optimizedPrompt: structuredPrompt,
                originalInput: data.userInput,
                metadata: {
                    processingTime,
                    tokensUsed: response.usageMetadata?.totalTokenCount || 0,
                    model: "gemini-pro",
                },
            };
        }
        catch (error) {
            console.error("Error generating prompt:", error);
            throw new common_1.InternalServerErrorException("Failed to generate optimized prompt");
        }
    }
    async getPromptHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [prompts, total] = await Promise.all([
            this.prisma.prompt.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    message: {
                        select: {
                            id: true,
                            conversationId: true,
                        },
                    },
                },
            }),
            this.prisma.prompt.count({
                where: { userId },
            }),
        ]);
        return {
            prompts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    createSystemPrompt(options) {
        const language = options?.language || "vi";
        if (language === "vi") {
            return `Bạn là một chuyên gia Prompt Engineering. Nhiệm vụ của bạn là tối ưu hóa các yêu cầu thô thành prompt có cấu trúc chuyên nghiệp.

QUAN TRỌNG: Luôn trả về prompt theo định dạng sau:

🎯 Goal: [Mục tiêu rõ ràng, cụ thể]

📥 Input: [Thông tin đầu vào cần thiết]

📤 Output: [Kết quả mong muốn, định dạng cụ thể]

📝 Instructions: 
1. [Hướng dẫn bước 1]
2. [Hướng dẫn bước 2]
3. [Hướng dẫn bước 3]

⚡ Notes: [Lưu ý quan trọng, context bổ sung]

Hãy tối ưu prompt để:
- Rõ ràng, không nhập nhằng
- Tiết kiệm token
- Dễ hiểu và thực hiện
- Có thể đo lường kết quả`;
        }
        else {
            return `You are a Prompt Engineering expert. Your task is to optimize raw requests into professionally structured prompts.

IMPORTANT: Always return prompts in this exact format:

🎯 Goal: [Clear, specific objective]

📥 Input: [Required input information]

📤 Output: [Expected result, specific format]

📝 Instructions:
1. [Step 1 instruction]
2. [Step 2 instruction] 
3. [Step 3 instruction]

⚡ Notes: [Important notes, additional context]

Optimize the prompt to be:
- Clear and unambiguous
- Token-efficient
- Easy to understand and execute
- Measurable results`;
        }
    }
    createUserPrompt(userInput, context, options) {
        const language = options?.language || "vi";
        let prompt = language === "vi"
            ? `Tối ưu hóa yêu cầu sau thành prompt có cấu trúc:\n\n"${userInput}"`
            : `Optimize the following request into a structured prompt:\n\n"${userInput}"`;
        if (context) {
            prompt +=
                language === "vi"
                    ? `\n\nBối cảnh hội thoại trước:\n${context}`
                    : `\n\nPrevious conversation context:\n${context}`;
        }
        if (options?.style) {
            prompt +=
                language === "vi"
                    ? `\n\nPhong cách: ${options.style}`
                    : `\n\nStyle: ${options.style}`;
        }
        return prompt;
    }
    parseStructuredPrompt(text) {
        try {
            const sections = {
                goal: "",
                input: "",
                output: "",
                instructions: [],
                notes: [],
                rawText: text,
            };
            const goalMatch = text.match(/🎯\s*Goal[:\s]*(.*?)(?=📥|$)/s);
            if (goalMatch)
                sections.goal = goalMatch[1].trim();
            const inputMatch = text.match(/📥\s*Input[:\s]*(.*?)(?=📤|$)/s);
            if (inputMatch)
                sections.input = inputMatch[1].trim();
            const outputMatch = text.match(/📤\s*Output[:\s]*(.*?)(?=📝|$)/s);
            if (outputMatch)
                sections.output = outputMatch[1].trim();
            const instructionsMatch = text.match(/📝\s*Instructions[:\s]*(.*?)(?=⚡|$)/s);
            if (instructionsMatch) {
                const instructionText = instructionsMatch[1].trim();
                sections.instructions = instructionText
                    .split(/\d+\./)
                    .filter((item) => item.trim())
                    .map((item) => item.trim());
            }
            const notesMatch = text.match(/⚡\s*Notes[:\s]*(.*?)$/s);
            if (notesMatch) {
                sections.notes = notesMatch[1]
                    .trim()
                    .split("\n")
                    .filter((item) => item.trim())
                    .map((item) => item.trim());
            }
            return sections;
        }
        catch (error) {
            return {
                goal: "Optimize the given request",
                input: "User request",
                output: "Structured prompt",
                instructions: [
                    "Process the request",
                    "Apply best practices",
                    "Return optimized prompt",
                ],
                notes: ["AI-generated prompt optimization"],
                rawText: text,
            };
        }
    }
};
exports.PromptsService = PromptsService;
exports.PromptsService = PromptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PromptsService);
//# sourceMappingURL=prompts.service.js.map