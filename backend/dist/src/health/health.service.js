"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        const status = "ok";
        const timestamp = new Date().toISOString();
        const uptime = process.uptime();
        const version = "1.0.0";
        const environment = process.env.NODE_ENV || "development";
        let database = "connected";
        try {
            await this.prisma.$queryRaw `SELECT 1`;
        }
        catch (error) {
            database = "disconnected";
        }
        let redis = "connected";
        try {
            if (!process.env.REDIS_URL) {
                redis = "not configured";
            }
        }
        catch (error) {
            redis = "disconnected";
        }
        return {
            status,
            timestamp,
            uptime,
            version,
            environment,
            database,
            redis,
        };
    }
    async detailedCheck() {
        const basicCheck = await this.check();
        const memory = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        let databaseDetails = {};
        try {
            const userCount = await this.prisma.user.count();
            const conversationCount = await this.prisma.conversation.count();
            const messageCount = await this.prisma.message.count();
            const promptCount = await this.prisma.prompt.count();
            databaseDetails = {
                users: userCount,
                conversations: conversationCount,
                messages: messageCount,
                prompts: promptCount,
            };
        }
        catch (error) {
            databaseDetails = { error: "Unable to fetch database statistics" };
        }
        return {
            ...basicCheck,
            memory: {
                rss: memory.rss,
                heapTotal: memory.heapTotal,
                heapUsed: memory.heapUsed,
                external: memory.external,
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
            },
            database: {
                status: basicCheck.database,
                details: databaseDetails,
            },
            services: {
                gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
                clerk: process.env.CLERK_SECRET_KEY ? "configured" : "not configured",
            },
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthService);
//# sourceMappingURL=health.service.js.map