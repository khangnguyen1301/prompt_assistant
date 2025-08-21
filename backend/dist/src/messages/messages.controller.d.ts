import { MessagesService, CreateMessageDto } from "./messages.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(user: AuthUser, createMessageDto: CreateMessageDto): Promise<any>;
    findByConversation(user: AuthUser, conversationId: string, page?: string, limit?: string): Promise<{
        messages: ({
            prompts: {
                id: string;
                createdAt: Date;
                structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            }[];
            uploadedFiles: {
                id: string;
                createdAt: Date;
                userId: string;
                messageId: string | null;
                geminiFileId: string | null;
                originalName: string;
                displayName: string;
                mimeType: string;
                sizeBytes: number;
                uri: string;
                sha256Hash: string;
                state: string;
                expirationTime: Date | null;
                cloudinaryPublicId: string | null;
                cloudinaryUrl: string | null;
                cloudinarySecureUrl: string | null;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            conversationId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(user: AuthUser, id: string): Promise<{
        conversation: {
            userId: string;
        };
        prompts: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
            messageId: string | null;
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
    }>;
    delete(user: AuthUser, id: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
    }>;
}
