import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const status = "ok";
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    const version = "1.0.0";
    const environment = process.env.NODE_ENV || "development";

    // Check database connection
    let database = "connected";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      database = "disconnected";
    }

    // Check Redis connection (basic check)
    let redis = "connected";
    try {
      // For now, we'll mark as connected if Redis env vars are present
      if (!process.env.REDIS_URL) {
        redis = "not configured";
      }
    } catch (error) {
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

    // Additional checks
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Check database tables
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
    } catch (error) {
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
}
