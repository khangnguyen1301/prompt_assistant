import { MessagesService, CreateMessageDto } from "./messages.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(user: AuthUser, createMessageDto: CreateMessageDto): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
    findByConversation(user: AuthUser, conversationId: string, page?: string, limit?: string): Promise<{
        messages: ({
            prompts: {
                id: string;
                structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
            }[];
        } & {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
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
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
            messageId: string | null;
        }[];
        conversation: {
            userId: string;
        };
    } & {
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
    delete(user: AuthUser, id: string): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
}
