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
var WebhooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = WebhooksController_1 = class WebhooksController {
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
        this.logger = new common_1.Logger(WebhooksController_1.name);
    }
    async handleClerkWebhook(payload, svixId, svixTimestamp, svixSignature) {
        try {
            this.logger.log("Received Clerk webhook", { type: payload.type });
            await this.webhooksService.handleClerkWebhook(payload, svixId, svixTimestamp, svixSignature);
            return { success: true };
        }
        catch (error) {
            this.logger.error("Webhook processing failed", error);
            throw new common_1.BadRequestException("Webhook processing failed");
        }
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)("clerk"),
    (0, swagger_1.ApiOperation)({ summary: "Handle Clerk webhook events" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("svix-id")),
    __param(2, (0, common_1.Headers)("svix-timestamp")),
    __param(3, (0, common_1.Headers)("svix-signature")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleClerkWebhook", null);
exports.WebhooksController = WebhooksController = WebhooksController_1 = __decorate([
    (0, swagger_1.ApiTags)("Webhooks"),
    (0, common_1.Controller)("webhooks"),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map