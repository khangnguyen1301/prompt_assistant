import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";
export interface GeneratePromptDto {
    userInput: string;
    images?: string[];
    fileUris?: Array<{
        uri: string;
        mimeType: string;
    }>;
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
    private readonly settingsService;
    constructor(prisma: PrismaService, configService: ConfigService, settingsService: SettingsService);
    generateOptimizedPrompt(data: GeneratePromptDto, clerkId: string): Promise<{
        id: any;
        optimizedPrompt: StructuredPrompt;
        originalInput: string;
        metadata: {
            processingTime: number;
            tokensUsed: any;
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
            userId: string;
            messageId: string | null;
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
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
    private isModificationRequest;
    private parseStructuredPrompt;
}
