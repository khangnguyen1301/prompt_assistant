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
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateFromClerk(clerkId: string, data: UpdateUserFromClerkDto): Promise<{
        id: string;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteByClerkId(clerkId: string): Promise<{
        id: string;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByClerkId(clerkId: string): Promise<{
        id: string;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findById(id: string): Promise<{
        id: string;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    upsertFromClerk(data: CreateUserFromClerkDto): Promise<{
        id: string;
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
