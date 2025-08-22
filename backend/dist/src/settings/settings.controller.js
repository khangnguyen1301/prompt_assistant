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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const clerk_auth_guard_1 = require("../auth/guards/clerk-auth.guard");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getApiKeyStatus(req) {
        console.log("🔍 SettingsController.getApiKeyStatus called");
        console.log("🔍 req.user:", req.user);
        const clerkId = req.user?.clerkId;
        console.log("🔍 Extracted clerkId:", clerkId);
        if (!clerkId) {
            console.error("🚨 No clerkId found in request");
            throw new common_1.BadRequestException("User ID not found in request");
        }
        return this.settingsService.getApiKeyStatus(clerkId);
    }
    async updateApiKey(req, body) {
        const clerkId = req.user?.clerkId;
        const { apiKey } = body;
        if (!apiKey || !apiKey.trim()) {
            throw new common_1.BadRequestException("API key is required");
        }
        if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
            throw new common_1.BadRequestException("Invalid Gemini API key format");
        }
        await this.settingsService.updateApiKey(clerkId, apiKey);
        return {
            success: true,
            message: "API key updated successfully",
        };
    }
    async validateApiKey(req) {
        const clerkId = req.user?.clerkId;
        return this.settingsService.validateApiKey(clerkId);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)("api-key/status"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getApiKeyStatus", null);
__decorate([
    (0, common_1.Put)("api-key"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateApiKey", null);
__decorate([
    (0, common_1.Put)("api-key/validate"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "validateApiKey", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)("settings"),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map