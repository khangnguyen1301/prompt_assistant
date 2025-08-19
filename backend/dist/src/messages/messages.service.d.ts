import { PrismaService } from "../prisma/prisma.service";
export declare enum MessageRole {
    USER = "USER",
    ASSISTANT = "ASSISTANT"
}
export interface CreateMessageDto {
    conversationId: string;
    role: MessageRole;
    content: string;
    metadata?: any;
}
export declare class MessagesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateMessageDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findByConversation(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
        messages: ({
            prompts: {
                id: string;
                createdAt: Date;
                structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(id: string, userId: string): Promise<{
        conversation: {
            userId: string;
        };
        prompts: {
            id: string;
            createdAt: Date;
            userId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            messageId: string | null;
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
