import { PrismaService } from "../prisma/prisma.service";
export interface CreateUserFromClerkDto {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}
export interface UpdateUserFromClerkDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createFromClerk(data: CreateUserFromClerkDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
    }>;
    updateFromClerk(clerkId: string, data: UpdateUserFromClerkDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
    }>;
    deleteByClerkId(clerkId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
    }>;
    findByClerkId(clerkId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
    }>;
    upsertFromClerk(data: CreateUserFromClerkDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
    }>;
}
