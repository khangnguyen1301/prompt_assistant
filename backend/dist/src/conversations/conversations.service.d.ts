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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        }[];
        _count: {
            messages: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        updatedAt: Date;
    }>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        conversations: ({
            messages: {
                id: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                conversationId: string;
                role: import(".prisma/client").$Enums.Role;
                content: string;
            }[];
            _count: {
                messages: number;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            title: string;
            updatedAt: Date;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, data: UpdateConversationDto): Promise<{
        messages: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.Role;
            content: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        updatedAt: Date;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        updatedAt: Date;
    }>;
    updateLastActivity(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        updatedAt: Date;
    }>;
}
