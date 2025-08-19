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
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
    findByConversation(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
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
    findOne(id: string, userId: string): Promise<{
        conversation: {
            userId: string;
        };
        prompts: {
            id: string;
            originalInput: string;
            structuredPrompt: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
            messageId: string | null;
        }[];
    } & {
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
}
