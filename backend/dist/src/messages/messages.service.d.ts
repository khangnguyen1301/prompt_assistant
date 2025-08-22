import { PrismaService } from "../prisma/prisma.service";
export declare enum MessageRole {
    USER = "USER",
    ASSISTANT = "ASSISTANT"
}
export interface CreateMessageDto {
    conversationId: string;
    role: string;
    content: string;
    metadata?: any;
    images?: string[];
    fileUris?: string[];
}
export declare class MessagesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateMessageDto, userId: string): Promise<any>;
    findByConversation(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
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
    findOne(id: string, userId: string): Promise<{
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
    delete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        conversationId: string;
        role: import(".prisma/client").$Enums.Role;
        content: string;
    }>;
}
