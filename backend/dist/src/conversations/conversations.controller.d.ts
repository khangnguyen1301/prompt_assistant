import { ConversationsService, CreateConversationDto, UpdateConversationDto } from "./conversations.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    create(user: AuthUser, createConversationDto: CreateConversationDto): Promise<{
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
    findAll(user: AuthUser, page?: string, limit?: string): Promise<{
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
    findOne(user: AuthUser, id: string): Promise<{
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
    update(user: AuthUser, id: string, updateConversationDto: UpdateConversationDto): Promise<{
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
    delete(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
}
