import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../auth/guards/clerk-auth.guard";
import { SettingsService } from "./settings.service";

export interface UpdateApiKeyDto {
  apiKey: string;
}

export interface ApiKeyStatusDto {
  hasApiKey: boolean;
  isValid?: boolean;
  lastValidated?: Date;
}

@Controller("settings")
@UseGuards(ClerkAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("api-key/status")
  async getApiKeyStatus(@Request() req): Promise<ApiKeyStatusDto> {
    console.log("🔍 SettingsController.getApiKeyStatus called");
    console.log("🔍 req.user:", req.user);

    const clerkId = req.user?.clerkId;
    console.log("🔍 Extracted clerkId:", clerkId);

    if (!clerkId) {
      console.error("🚨 No clerkId found in request");
      throw new BadRequestException("User ID not found in request");
    }

    return this.settingsService.getApiKeyStatus(clerkId);
  }

  @Put("api-key")
  async updateApiKey(
    @Request() req,
    @Body() body: UpdateApiKeyDto
  ): Promise<{ success: boolean; message: string }> {
    const clerkId = req.user?.clerkId;
    const { apiKey } = body;

    if (!apiKey || !apiKey.trim()) {
      throw new BadRequestException("API key is required");
    }

    // Basic validation for Gemini API key format
    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      throw new BadRequestException("Invalid Gemini API key format");
    }

    await this.settingsService.updateApiKey(clerkId, apiKey);

    return {
      success: true,
      message: "API key updated successfully",
    };
  }

  @Put("api-key/validate")
  async validateApiKey(
    @Request() req
  ): Promise<{ isValid: boolean; message: string }> {
    const clerkId = req.user?.clerkId;
    return this.settingsService.validateApiKey(clerkId);
  }
}
