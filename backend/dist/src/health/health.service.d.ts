import { PrismaService } from "@/prisma/prisma.service";
export declare class HealthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
        database: string;
        redis: string;
    }>;
    detailedCheck(): Promise<{
        memory: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
        };
        cpu: {
            user: number;
            system: number;
        };
        database: {
            status: string;
            details: {};
        };
        services: {
            gemini: string;
            clerk: string;
        };
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
        redis: string;
    }>;
}
