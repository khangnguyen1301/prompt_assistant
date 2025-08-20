import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleGenAI } from "@google/genai";

export interface GeneratePromptDto {
  userInput: string;
  conversationId?: string;
  options?: {
    language?: "vi" | "en";
    style?: "formal" | "casual" | "technical" | "professional";
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
  private ai: GoogleGenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }

    // Use new @google/genai API structure
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateOptimizedPrompt(data: GeneratePromptDto, clerkId: string) {
    try {
      // Validate input
      if (!data.userInput?.trim()) {
        throw new BadRequestException("User input is required");
      }

      // Find user by clerkId to get database userId
      const user = await this.prisma.user.findUnique({
        where: { id: clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      // Get conversation context if provided - smarter context handling
      let lastAssistantMessage = "";
      let isModificationRequest = false;

      if (data.conversationId) {
        const conversation = await this.prisma.conversation.findUnique({
          where: { id: data.conversationId },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 2, // Only last 2 messages (current user + last assistant)
            },
          },
        });

        if (
          conversation &&
          conversation.userId === user.id &&
          conversation.messages.length > 0
        ) {
          // Get the last assistant message (should be the most recent prompt)
          const lastAssistant = conversation.messages.find(
            (msg) => msg.role === "ASSISTANT"
          );
          if (lastAssistant) {
            lastAssistantMessage = lastAssistant.content;

            // Detect if this is a modification request
            isModificationRequest = this.isModificationRequest(data.userInput);
          }
        }
      }

      // Create system prompt for Gemini
      const systemPrompt = this.createSystemPrompt(data.options);

      // Create user prompt with context
      const userPrompt = this.createUserPrompt(
        data.userInput,
        lastAssistantMessage,
        isModificationRequest,
        data.options
      );

      // Call Gemini API using new @google/genai structure
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

      // Parse structured prompt
      const structuredPrompt = this.parseStructuredPrompt(optimizedPromptText);

      // Save to database
      const savedPrompt = await this.prisma.prompt.create({
        data: {
          userId: user.id,
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
          model: "gemini-2.5-pro",
        },
      };
    } catch (error) {
      console.error("Error generating prompt:", error);
      throw new InternalServerErrorException(
        "Failed to generate optimized prompt"
      );
    }
  }

  async getPromptHistory(clerkId: string, page = 1, limit = 20) {
    // Find user by clerkId to get database userId
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
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

  private createSystemPrompt(options?: any): string {
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
    } else {
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

  private createUserPrompt(
    userInput: string,
    lastAssistantMessage: string,
    isModificationRequest: boolean,
    options?: any
  ): string {
    const language = options?.language || "vi";

    let prompt = "";

    if (isModificationRequest && lastAssistantMessage) {
      // This is a modification request, provide context for refinement
      prompt =
        language === "vi"
          ? `Dựa trên prompt đã tối ưu trước đó, hãy chỉnh sửa theo yêu cầu mới.\n\nPrompt trước đó:\n${lastAssistantMessage}\n\nYêu cầu chỉnh sửa: "${userInput}"\n\nHãy trả về prompt đã được chỉnh sửa theo định dạng chuẩn.`
          : `Based on the previously optimized prompt, please modify it according to the new request.\n\nPrevious prompt:\n${lastAssistantMessage}\n\nModification request: "${userInput}"\n\nReturn the modified prompt in standard format.`;
    } else {
      // This is a new prompt optimization request
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

  private isModificationRequest(userInput: string): boolean {
    const modificationKeywords = [
      // Vietnamese keywords
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
      // English keywords
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
    return modificationKeywords.some((keyword) =>
      input.includes(keyword.toLowerCase())
    );
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
