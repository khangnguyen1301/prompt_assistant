import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
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
export declare class PromptsService {
    private readonly prisma;
    private readonly configService;
    private genAI;
    private model;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateOptimizedPrompt(data: GeneratePromptDto, userId: string): Promise<{
        id: string;
        optimizedPrompt: StructuredPrompt;
        originalInput: string;
        metadata: {
            processingTime: number;
            tokensUsed: any;
            model: string;
        };
    }>;
    getPromptHistory(userId: string, page?: number, limit?: number): Promise<{
        prompts: ({
            message: {
                id: string;
                conversationId: string;
            };
        } & {
            id: string;
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
            messageId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    private createSystemPrompt;
    private createUserPrompt;
    private parseStructuredPrompt;
}
