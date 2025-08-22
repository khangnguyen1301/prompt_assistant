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
                updatedAt: Date;
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(user: AuthUser, id: string): Promise<{
        prompts: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string | null;
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        conversation: {
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
    delete(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
}
