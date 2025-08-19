import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
export interface ClerkUser {
    id: string;
    email_addresses: Array<{
        email_address: string;
        id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
}
export interface AuthenticatedUser {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    verifyClerkToken(token: string): Promise<AuthenticatedUser>;
    saveOrUpdateUser(clerkUser: any, token: string, session: any): Promise<AuthenticatedUser>;
    getUserByToken(token: string): Promise<AuthenticatedUser | null>;
    invalidateSession(token: string): Promise<boolean>;
    saveOrUpdateMockUser(mockUser: any, token: string): Promise<AuthenticatedUser>;
    cleanExpiredSessions(): Promise<void>;
}
