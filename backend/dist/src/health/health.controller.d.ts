import { HealthService } from "./health.service";
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
        database: string;
        redis: string;
    }>;
    detailed(): Promise<{
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
