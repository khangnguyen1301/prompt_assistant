import { Module } from "@nestjs/common";
import { PromptsController } from "./prompts.controller";
import { PromptsService } from "./prompts.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [PromptsController],
  providers: [PromptsService],
  exports: [PromptsService],
})
export class PromptsModule {}
