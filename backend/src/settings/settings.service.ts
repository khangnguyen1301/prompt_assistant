import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApiKeyStatus(clerkId: string) {
    console.log(
      "🔍 SettingsService.getApiKeyStatus called with clerkId:",
      clerkId
    );

    if (!clerkId) {
      console.error("🚨 clerkId is undefined or null");
      throw new BadRequestException("User ID is required");
    }

    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: {
        geminiApiKey: true,
        updatedAt: true,
      },
    });

    console.log("🔍 User found:", !!user);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      hasApiKey: !!user.geminiApiKey,
      lastValidated: user.updatedAt,
    };
  }

  async updateApiKey(clerkId: string, apiKey: string) {
    // Validate API key by making a test request
    const isValid = await this.testApiKey(apiKey);

    if (!isValid) {
      throw new BadRequestException(
        "Invalid API key. Please check your Gemini API key."
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Update user with new API key
    await this.prisma.user.update({
      where: { clerkId },
      data: {
        geminiApiKey: apiKey,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  }

  async validateApiKey(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { geminiApiKey: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.geminiApiKey) {
      return {
        isValid: false,
        message: "No API key configured",
      };
    }

    return {
      isValid: user.geminiApiKey ? true : false,
      message: user.geminiApiKey
        ? "API key is valid"
        : "API key is invalid or expired",
    };
  }

  async getUserApiKey(clerkId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: clerkId },
      select: { geminiApiKey: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user.geminiApiKey;
  }

  private async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Test with a simple request
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works in a few words",
      });
      console.log("🚀 ~ SettingsService ~ testApiKey ~ response:", response);

      return !!response && !!response.text;
    } catch (error) {
      console.error("API key test failed:", error);
      return false;
    }
  }
}
