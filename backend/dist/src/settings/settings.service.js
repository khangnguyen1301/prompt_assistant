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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const genai_1 = require("@google/genai");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getApiKeyStatus(clerkId) {
        console.log("🔍 SettingsService.getApiKeyStatus called with clerkId:", clerkId);
        if (!clerkId) {
            console.error("🚨 clerkId is undefined or null");
            throw new common_1.BadRequestException("User ID is required");
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
            throw new common_1.NotFoundException("User not found");
        }
        return {
            hasApiKey: !!user.geminiApiKey,
            lastValidated: user.updatedAt,
        };
    }
    async updateApiKey(clerkId, apiKey) {
        const isValid = await this.testApiKey(apiKey);
        if (!isValid) {
            throw new common_1.BadRequestException("Invalid API key. Please check your Gemini API key.");
        }
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        await this.prisma.user.update({
            where: { clerkId },
            data: {
                geminiApiKey: apiKey,
                updatedAt: new Date(),
            },
        });
        return { success: true };
    }
    async validateApiKey(clerkId) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
            select: { geminiApiKey: true },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
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
    async getUserApiKey(clerkId) {
        const user = await this.prisma.user.findUnique({
            where: { id: clerkId },
            select: { geminiApiKey: true },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user.geminiApiKey;
    }
    async testApiKey(apiKey) {
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Explain how AI works in a few words",
            });
            console.log("🚀 ~ SettingsService ~ testApiKey ~ response:", response);
            return !!response && !!response.text;
        }
        catch (error) {
            console.error("API key test failed:", error);
            return false;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map