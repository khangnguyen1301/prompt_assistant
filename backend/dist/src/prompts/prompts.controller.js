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
exports.PromptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prompts_service_1 = require("./prompts.service");
const clerk_auth_guard_1 = require("../auth/guards/clerk-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PromptsController = class PromptsController {
    constructor(promptsService) {
        this.promptsService = promptsService;
    }
    async generatePrompt(user, generatePromptDto) {
        return this.promptsService.generateOptimizedPrompt(generatePromptDto, user.clerkId);
    }
    async getHistory(user, page = "1", limit = "20") {
        return this.promptsService.getPromptHistory(user.clerkId, parseInt(page), parseInt(limit));
    }
};
exports.PromptsController = PromptsController;
__decorate([
    (0, common_1.Post)("generate"),
    (0, swagger_1.ApiOperation)({ summary: "Generate optimized prompt from user input" }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Prompt generated successfully",
        schema: {
            type: "object",
            properties: {
                id: { type: "string" },
                optimizedPrompt: {
                    type: "object",
                    properties: {
                        goal: { type: "string" },
                        input: { type: "string" },
                        output: { type: "string" },
                        instructions: { type: "array", items: { type: "string" } },
                        notes: { type: "array", items: { type: "string" } },
                        rawText: { type: "string" },
                    },
                },
                originalInput: { type: "string" },
                metadata: {
                    type: "object",
                    properties: {
                        processingTime: { type: "number" },
                        tokensUsed: { type: "number" },
                        model: { type: "string" },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Invalid input" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "AI service error" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PromptsController.prototype, "generatePrompt", null);
__decorate([
    (0, common_1.Get)("history"),
    (0, swagger_1.ApiOperation)({ summary: "Get prompt generation history" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "History retrieved successfully" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PromptsController.prototype, "getHistory", null);
exports.PromptsController = PromptsController = __decorate([
    (0, swagger_1.ApiTags)("Prompts"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Controller)("prompts"),
    __metadata("design:paramtypes", [prompts_service_1.PromptsService])
], PromptsController);
//# sourceMappingURL=prompts.controller.js.map