import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratePromptDto {
  userInput: string;
  conversationId?: string;
  options?: {
    language?: "vi" | "en";
    style?: "formal" | "casual" | "technical";
    includeExamples?: boolean;
  };
}

export interface StructuredPrompt {
  goal: string;
  input: string;
  output: string;
  instructions: string[];
  notes: string[];
  rawText: string;
}

@Injectable()
export class PromptsService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateOptimizedPrompt(data: GeneratePromptDto, userId: string) {
    try {
      // Validate input
      if (!data.userInput?.trim()) {
        throw new BadRequestException("User input is required");
      }

      // Get conversation context if provided
      let conversationContext = "";
      if (data.conversationId) {
        const conversation = await this.prisma.conversation.findUnique({
          where: { id: data.conversationId },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 5, // Last 5 messages for context
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

      // Create system prompt for Gemini
      const systemPrompt = this.createSystemPrompt(data.options);

      // Create user prompt with context
      const userPrompt = this.createUserPrompt(
        data.userInput,
        conversationContext,
        data.options
      );

      // Call Gemini API
      const startTime = Date.now();
      const result = await this.model.generateContent([
        systemPrompt,
        userPrompt,
      ]);
      const processingTime = Date.now() - startTime;

      const response = await result.response;
      const optimizedPromptText = response.text();

      // Parse structured prompt
      const structuredPrompt = this.parseStructuredPrompt(optimizedPromptText);

      // Save to database
      const savedPrompt = await this.prisma.prompt.create({
        data: {
          userId,
          originalInput: data.userInput,
          structuredPrompt: structuredPrompt as any,
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
    } catch (error) {
      console.error("Error generating prompt:", error);
      throw new InternalServerErrorException(
        "Failed to generate optimized prompt"
      );
    }
  }

  async getPromptHistory(userId: string, page = 1, limit = 20) {
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

  private createSystemPrompt(options?: any): string {
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
    } else {
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

  private createUserPrompt(
    userInput: string,
    context: string,
    options?: any
  ): string {
    const language = options?.language || "vi";

    let prompt =
      language === "vi"
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

  private parseStructuredPrompt(text: string): StructuredPrompt {
    try {
      const sections = {
        goal: "",
        input: "",
        output: "",
        instructions: [] as string[],
        notes: [] as string[],
        rawText: text,
      };

      // Extract Goal
      const goalMatch = text.match(/🎯\s*Goal[:\s]*(.*?)(?=📥|$)/s);
      if (goalMatch) sections.goal = goalMatch[1].trim();

      // Extract Input
      const inputMatch = text.match(/📥\s*Input[:\s]*(.*?)(?=📤|$)/s);
      if (inputMatch) sections.input = inputMatch[1].trim();

      // Extract Output
      const outputMatch = text.match(/📤\s*Output[:\s]*(.*?)(?=📝|$)/s);
      if (outputMatch) sections.output = outputMatch[1].trim();

      // Extract Instructions
      const instructionsMatch = text.match(
        /📝\s*Instructions[:\s]*(.*?)(?=⚡|$)/s
      );
      if (instructionsMatch) {
        const instructionText = instructionsMatch[1].trim();
        sections.instructions = instructionText
          .split(/\d+\./)
          .filter((item) => item.trim())
          .map((item) => item.trim());
      }

      // Extract Notes
      const notesMatch = text.match(/⚡\s*Notes[:\s]*(.*?)$/s);
      if (notesMatch) {
        sections.notes = notesMatch[1]
          .trim()
          .split("\n")
          .filter((item) => item.trim())
          .map((item) => item.trim());
      }

      return sections;
    } catch (error) {
      // Fallback parsing
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
}
