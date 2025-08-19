import { ConversationsService, CreateConversationDto, UpdateConversationDto } from "./conversations.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    create(user: AuthUser, createConversationDto: CreateConversationDto): Promise<{
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
    findAll(user: AuthUser, page?: string, limit?: string): Promise<{
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
    update(user: AuthUser, id: string, updateConversationDto: UpdateConversationDto): Promise<{
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
    delete(user: AuthUser, id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
