import { Module } from "@nestjs/common";

import { ClerkAuthGuard } from "./guards/clerk-auth.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}
