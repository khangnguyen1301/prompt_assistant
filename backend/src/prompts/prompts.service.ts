import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";
import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";

export interface GeneratePromptDto {
  userInput: string;
  images?: string[]; // Base64 strings for backward compatibility
  fileUris?: Array<{ uri: string; mimeType: string }>; // Gemini file URIs for new ai.files approach
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService
  ) {}

  async generateOptimizedPrompt(data: GeneratePromptDto, clerkId: string) {
    console.log(
      "🚀 ~ PromptsService ~ generateOptimizedPrompt ~ clerkId:",
      clerkId
    );
    try {
      // Validate input - allow either text, images, or file URIs
      if (
        !data.userInput?.trim() &&
        (!data.images || data.images.length === 0) &&
        (!data.fileUris || data.fileUris.length === 0)
      ) {
        throw new BadRequestException(
          "User input, images, or file URIs are required"
        );
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
        try {
          const conversation = await this.prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 5,
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
              isModificationRequest = this.isModificationRequest(
                data.userInput
              );
            }
          }
        } catch (error) {
          console.warn("Error fetching conversation context:", error);
          // Continue without context if conversation fetch fails
        }
      }

      // Create system prompt for Gemini
      const systemPrompt = this.createSystemPrompt(data.options);

      // Create user prompt with context
      const userPrompt = this.createUserPrompt(
        data.userInput || "", // Allow empty string if only images
        lastAssistantMessage,
        isModificationRequest,
        data.options,
        (data.images && data.images.length > 0) ||
          (data.fileUris && data.fileUris.length > 0) // Pass image flag
      );

      console.log("🚀 User Input:", data.userInput);
      console.log("🚀 Generated User Prompt:", userPrompt);

      // Prepare content for Gemini - with error handling
      const parts = [];

      // Add text content
      if (userPrompt && userPrompt.trim()) {
        parts.push({ text: userPrompt });
      }

      // Add images if provided (base64 - legacy support)
      if (data.images && data.images.length > 0) {
        console.log("🚀 Adding images:", data.images.length);
        try {
          data.images.forEach((image, index) => {
            if (image && image.trim()) {
              parts.push({
                inlineData: {
                  mimeType: "image/jpeg", // Assume JPEG, could be improved to detect actual type
                  data: image,
                },
              });
            } else {
              console.warn(`Skipping empty image at index ${index}`);
            }
          });
        } catch (error) {
          console.error("Error processing images:", error);
          throw new BadRequestException("Invalid image format");
        }
      }

      // Add file URIs if provided (new ai.files approach)
      if (data.fileUris && data.fileUris.length > 0) {
        console.log("🚀 Adding file URIs:", data.fileUris.length);
        try {
          data.fileUris.forEach((file, index) => {
            if (file && file.uri && file.mimeType) {
              console.log(`🚀 Processing file ${index}:`, file);
              parts.push(createPartFromUri(file.uri, file.mimeType));
            } else {
              console.warn(`Skipping invalid file at index ${index}:`, file);
            }
          });
        } catch (error) {
          console.error("Error processing file URIs:", error);
          throw new BadRequestException("Invalid file URI format");
        }
      }

      // Validate we have at least some content
      if (parts.length === 0) {
        throw new BadRequestException("No valid content to process");
      }

      console.log("🚀 Final parts for Gemini:", JSON.stringify(parts, null, 2));

      // Get user's API key from database
      const userApiKey = await this.settingsService.getUserApiKey(clerkId);

      if (!userApiKey) {
        throw new BadRequestException(
          "No Gemini API key configured. Please add your API key in settings."
        );
      }

      // Create AI instance with user's API key
      const ai = new GoogleGenAI({ apiKey: userApiKey });

      // Call Gemini API with retry logic
      const startTime = Date.now();
      let response;

      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: parts,
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 8192,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        });

        console.log("🚀 Gemini Response received");
        console.log("🔍 Full response:", JSON.stringify(response, null, 2));
        console.log("🔍 Response.text:", response.text);
        console.log("🔍 Response.candidates:", response.candidates);
      } catch (geminiError) {
        console.error("� Gemini API Error:", geminiError);

        // Check if it's a specific error we can handle
        if (geminiError.message?.includes("INTERNAL")) {
          throw new InternalServerErrorException(
            "Gemini API is temporarily unavailable. Please try again in a moment."
          );
        } else if (geminiError.message?.includes("PERMISSION_DENIED")) {
          throw new InternalServerErrorException(
            "API authentication error. Please contact support."
          );
        } else if (geminiError.message?.includes("INVALID_ARGUMENT")) {
          throw new BadRequestException(
            "Invalid request format. Please check your input."
          );
        } else {
          throw new InternalServerErrorException(
            `Failed to generate prompt: ${geminiError.message || "Unknown error"}`
          );
        }
      }

      const processingTime = Date.now() - startTime;

      // Try different ways to access the response text
      let optimizedPromptText = "";

      if (response.text) {
        optimizedPromptText = response.text;
      } else if (
        response.candidates &&
        response.candidates[0]?.content?.parts?.[0]?.text
      ) {
        optimizedPromptText = response.candidates[0].content.parts[0].text;
      } else if (response.candidates && response.candidates[0]?.output) {
        optimizedPromptText = response.candidates[0].output;
      }

      console.log("🚀 Extracted prompt text:", optimizedPromptText);

      if (!optimizedPromptText || !optimizedPromptText.trim()) {
        console.error(
          "🚨 No text found in response:",
          JSON.stringify(response, null, 2)
        );
        throw new InternalServerErrorException(
          "Gemini API returned empty response. This might be due to content filtering or API issues."
        );
      }

      // Parse structured prompt
      const structuredPrompt = this.parseStructuredPrompt(optimizedPromptText);

      // Save to database with error handling
      let savedPrompt;
      try {
        savedPrompt = await this.prisma.prompt.create({
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
      } catch (dbError) {
        console.error("Error saving prompt to database:", dbError);
        // Still return the result even if database save fails
        return {
          id: "temp-" + Date.now(),
          optimizedPrompt: structuredPrompt,
          originalInput: data.userInput,
          metadata: {
            processingTime,
            tokensUsed: response.usageMetadata?.totalTokenCount || 0,
            model: "gemini-2.5-pro",
          },
        };
      }

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
      console.error("🚨 Error generating prompt:", error);

      // Re-throw known errors
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerErrorException(
        `Failed to generate optimized prompt: ${error.message || "Unknown error"}`
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
    options?: any,
    hasImages = false
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
      if (hasImages && !userInput.trim()) {
        // Only images, no text
        prompt =
          language === "vi"
            ? `Hãy phân tích các hình ảnh được cung cấp và tạo một prompt có cấu trúc dựa trên nội dung hình ảnh. Prompt cần rõ ràng và có thể sử dụng để hướng dẫn AI xử lý các hình ảnh tương tự.`
            : `Please analyze the provided images and create a structured prompt based on the image content. The prompt should be clear and usable to guide AI in processing similar images.`;
      } else if (hasImages && userInput.trim()) {
        // Both text and images
        prompt =
          language === "vi"
            ? `Dựa trên mô tả: "${userInput}" và các hình ảnh được cung cấp, hãy tối ưu hóa thành prompt có cấu trúc. Kết hợp thông tin từ cả text và hình ảnh để tạo prompt toàn diện.`
            : `Based on the description: "${userInput}" and the provided images, optimize into a structured prompt. Combine information from both text and images to create a comprehensive prompt.`;
      } else {
        // Only text, no images
        prompt =
          language === "vi"
            ? `Tối ưu hóa yêu cầu sau thành prompt có cấu trúc:\n\n"${userInput}"`
            : `Optimize the following request into a structured prompt:\n\n"${userInput}"`;
      }
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
