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
const genai_1 = require("@google/genai");
let PromptsService = class PromptsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    async generateOptimizedPrompt(data, clerkId) {
        try {
            if (!data.userInput?.trim()) {
                throw new common_1.BadRequestException("User input is required");
            }
            const user = await this.prisma.user.findUnique({
                where: { id: clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            let lastAssistantMessage = "";
            let isModificationRequest = false;
            if (data.conversationId) {
                const conversation = await this.prisma.conversation.findUnique({
                    where: { id: data.conversationId },
                    include: {
                        messages: {
                            orderBy: { createdAt: "desc" },
                            take: 2,
                        },
                    },
                });
                if (conversation &&
                    conversation.userId === user.id &&
                    conversation.messages.length > 0) {
                    const lastAssistant = conversation.messages.find((msg) => msg.role === "ASSISTANT");
                    if (lastAssistant) {
                        lastAssistantMessage = lastAssistant.content;
                        isModificationRequest = this.isModificationRequest(data.userInput);
                    }
                }
            }
            const systemPrompt = this.createSystemPrompt(data.options);
            const userPrompt = this.createUserPrompt(data.userInput, lastAssistantMessage, isModificationRequest, data.options);
            const startTime = Date.now();
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                },
            });
            const processingTime = Date.now() - startTime;
            const optimizedPromptText = response.text;
            const structuredPrompt = this.parseStructuredPrompt(optimizedPromptText);
            const savedPrompt = await this.prisma.prompt.create({
                data: {
                    userId: user.id,
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
                    model: "gemini-2.5-pro",
                },
            };
        }
        catch (error) {
            console.error("Error generating prompt:", error);
            throw new common_1.InternalServerErrorException("Failed to generate optimized prompt");
        }
    }
    async getPromptHistory(clerkId, page = 1, limit = 20) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
        });
        if (!user) {
            throw new common_1.BadRequestException("User not found");
        }
        const skip = (page - 1) * limit;
        const [prompts, total] = await Promise.all([
            this.prisma.prompt.findMany({
                where: { userId: user.id },
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
                where: { userId: user.id },
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
            return `Bạn là một chuyên gia Prompt Engineering. Nhiệm vụ của bạn là tối ưu hóa các yêu cầu thô thành prompt có cấu trúc chuyên nghiệp hoặc chỉnh sửa prompt hiện có.

QUAN TRỌNG: Luôn trả về prompt theo định dạng chính xác sau (bao gồm emoji):

🎯 Goal: [Mục tiêu rõ ràng, cụ thể]

📥 Input: [Thông tin đầu vào cần thiết]

📤 Output: [Kết quả mong muốn, định dạng cụ thể]

📝 Instructions: 
1. [Hướng dẫn bước 1]
2. [Hướng dẫn bước 2]
3. [Hướng dẫn bước 3]

⚡ Notes: [Lưu ý quan trọng, context bổ sung]

QUY TẮC:
- Luôn giữ nguyên định dạng với emoji chính xác
- Nếu là yêu cầu chỉnh sửa, hãy kế thừa nội dung tốt từ prompt cũ
- Chỉ thay đổi những phần được yêu cầu chỉnh sửa
- Đảm bảo prompt cuối cùng nhất quán, logic và thực thi được

Hãy tối ưu prompt để:
- Rõ ràng, không nhập nhằng
- Tiết kiệm token
- Dễ hiểu và thực hiện
- Có thể đo lường kết quả`;
        }
        else {
            return `You are a Prompt Engineering expert. Your task is to optimize raw requests into professionally structured prompts or modify existing prompts.

IMPORTANT: Always return prompts in this exact format (including emojis):

🎯 Goal: [Clear, specific objective]

📥 Input: [Required input information]

📤 Output: [Expected result, specific format]

📝 Instructions:
1. [Step 1 instruction]
2. [Step 2 instruction] 
3. [Step 3 instruction]

⚡ Notes: [Important notes, additional context]

RULES:
- Always maintain exact format with correct emojis
- If modifying existing prompt, inherit good content from previous version
- Only change parts that are requested to be modified
- Ensure final prompt is consistent, logical and executable

Optimize the prompt to be:
- Clear and unambiguous
- Token-efficient
- Easy to understand and execute
- Measurable results`;
        }
    }
    createUserPrompt(userInput, lastAssistantMessage, isModificationRequest, options) {
        const language = options?.language || "vi";
        let prompt = "";
        if (isModificationRequest && lastAssistantMessage) {
            prompt =
                language === "vi"
                    ? `Dựa trên prompt đã tối ưu trước đó, hãy chỉnh sửa theo yêu cầu mới.\n\nPrompt trước đó:\n${lastAssistantMessage}\n\nYêu cầu chỉnh sửa: "${userInput}"\n\nHãy trả về prompt đã được chỉnh sửa theo định dạng chuẩn.`
                    : `Based on the previously optimized prompt, please modify it according to the new request.\n\nPrevious prompt:\n${lastAssistantMessage}\n\nModification request: "${userInput}"\n\nReturn the modified prompt in standard format.`;
        }
        else {
            prompt =
                language === "vi"
                    ? `Tối ưu hóa yêu cầu sau thành prompt có cấu trúc:\n\n"${userInput}"`
                    : `Optimize the following request into a structured prompt:\n\n"${userInput}"`;
        }
        if (options?.style) {
            prompt +=
                language === "vi"
                    ? `\n\nPhong cách: ${options.style}`
                    : `\n\nStyle: ${options.style}`;
        }
        return prompt;
    }
    isModificationRequest(userInput) {
        const modificationKeywords = [
            "chỉnh sửa",
            "sửa",
            "thay đổi",
            "điều chỉnh",
            "cập nhật",
            "bổ sung",
            "thêm",
            "bớt",
            "rút gọn",
            "mở rộng",
            "làm ngắn",
            "làm dài",
            "chi tiết hơn",
            "đơn giản hơn",
            "thêm vào",
            "bỏ đi",
            "thay thế",
            "cải thiện",
            "tối ưu",
            "modify",
            "edit",
            "change",
            "update",
            "add",
            "remove",
            "expand",
            "shorten",
            "improve",
            "refine",
            "adjust",
            "revise",
            "enhance",
            "simplify",
            "detail",
            "extend",
            "reduce",
            "replace",
        ];
        const input = userInput.toLowerCase();
        return modificationKeywords.some((keyword) => input.includes(keyword.toLowerCase()));
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