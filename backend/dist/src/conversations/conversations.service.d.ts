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
        _count: {
            messages: number;
        };
        messages: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        conversations: ({
            _count: {
                messages: number;
            };
            messages: {
                id: string;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                conversationId: string;
                role: import(".prisma/client").$Enums.Role;
                content: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    update(id: string, userId: string, data: UpdateConversationDto): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    updateLastActivity(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
}
