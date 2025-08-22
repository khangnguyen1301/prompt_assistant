import { PrismaService } from "../prisma/prisma.service";
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getApiKeyStatus(clerkId: string): Promise<{
        hasApiKey: boolean;
        lastValidated: Date;
    }>;
    updateApiKey(clerkId: string, apiKey: string): Promise<{
        success: boolean;
    }>;
    validateApiKey(clerkId: string): Promise<{
        isValid: boolean;
        message: string;
    }>;
    getUserApiKey(clerkId: string): Promise<string | null>;
    private testApiKey;
}
