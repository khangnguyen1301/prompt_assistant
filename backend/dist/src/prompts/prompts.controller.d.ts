import { PromptsService, GeneratePromptDto } from "./prompts.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class PromptsController {
    private readonly promptsService;
    constructor(promptsService: PromptsService);
    generatePrompt(user: AuthUser, generatePromptDto: GeneratePromptDto): Promise<{
        id: any;
        optimizedPrompt: import("./prompts.service").StructuredPrompt;
        originalInput: string;
        metadata: {
            processingTime: number;
            tokensUsed: any;
            model: string;
        };
    }>;
    getHistory(user: AuthUser, page?: string, limit?: string): Promise<{
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
}
