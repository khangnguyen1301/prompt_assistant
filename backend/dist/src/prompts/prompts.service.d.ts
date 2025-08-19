import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
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
export declare class PromptsService {
    private readonly prisma;
    private readonly configService;
    private ai;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateOptimizedPrompt(data: GeneratePromptDto, clerkId: string): Promise<{
        id: string;
        optimizedPrompt: StructuredPrompt;
        originalInput: string;
        metadata: {
            processingTime: number;
            tokensUsed: number;
            model: string;
        };
    }>;
    getPromptHistory(clerkId: string, page?: number, limit?: number): Promise<{
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
