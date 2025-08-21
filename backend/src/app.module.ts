import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { MessagesModule } from "./messages/messages.module";
import { PromptsModule } from "./prompts/prompts.module";
import { FilesModule } from "./files/files.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { HealthModule } from "./health/health.module";
// import { WinstonModule } from 'nest-winston';
// import * as winston from 'winston';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Logging (temporarily disabled)
    // WinstonModule.forRoot({
    //   transports: [
    //     new winston.transports.Console({
    //       format: winston.format.combine(
    //         winston.format.timestamp(),
    //         winston.format.colorize(),
    //         winston.format.simple(),
    //       ),
    //     }),
    //     new winston.transports.File({
    //       filename: 'logs/error.log',
    //       level: 'error',
    //       format: winston.format.json(),
    //     }),
    //     new winston.transports.File({
    //       filename: 'logs/combined.log',
    //       format: winston.format.json(),
    //     }),
    //   ],
    // }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes
    }),

    // Application modules
    PrismaModule,
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    PromptsModule,
    FilesModule,
    WebhooksModule,
    HealthModule,
  ],
})
export class AppModule {}
