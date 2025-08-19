import { PrismaService } from "../prisma/prisma.service";
export interface CreateConversationDto {
    userId: string;
    title: string;
}
export interface UpdateConversationDto {
    title?: string;
}
export declare class ConversationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateConversationDto): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        _count: {
            messages: number;
        };
    } & {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        conversations: ({
            messages: {
                id: string;
                createdAt: Date;
                conversationId: string;
                role: import(".prisma/client").$Enums.Role;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
            _count: {
                messages: number;
            };
        } & {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(id: string, userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            imageUrl: string;
        };
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, userId: string, data: UpdateConversationDto): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    updateLastActivity(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
