import { Module } from "@nestjs/common";
import { PromptsController } from "./prompts.controller";
import { PromptsService } from "./prompts.service";
import { AuthModule } from "../auth/auth.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [AuthModule, SettingsModule],
  controllers: [PromptsController],
  providers: [PromptsService],
  exports: [PromptsService],
})
export class PromptsModule {}
