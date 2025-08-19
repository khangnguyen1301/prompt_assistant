import { ConversationsService, CreateConversationDto, UpdateConversationDto } from "./conversations.service";
import { AuthUser } from "@/auth/decorators/current-user.decorator";
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    create(user: AuthUser, createConversationDto: CreateConversationDto): Promise<{
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
    findAll(user: AuthUser, page?: string, limit?: string): Promise<{
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
    update(user: AuthUser, id: string, updateConversationDto: UpdateConversationDto): Promise<{
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
    delete(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        updatedAt: Date;
    }>;
}
