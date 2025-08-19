import { MessagesService, CreateMessageDto } from "./messages.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(user: AuthUser, createMessageDto: CreateMessageDto): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
    }>;
    findByConversation(user: AuthUser, conversationId: string, page?: string, limit?: string): Promise<{
        messages: ({
            prompts: {
                id: string;
                createdAt: Date;
                structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
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
