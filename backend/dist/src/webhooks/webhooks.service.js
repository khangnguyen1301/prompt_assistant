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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const svix_1 = require("svix");
const users_service_1 = require("../users/users.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(WebhooksService_1.name);
        const webhookSecret = this.configService.get("CLERK_WEBHOOK_SECRET");
        if (webhookSecret && webhookSecret !== "your-clerk-webhook-secret") {
            try {
                this.webhook = new svix_1.Webhook(webhookSecret);
            }
            catch (error) {
                this.logger.warn("Failed to initialize webhook, using mock verification:", error.message);
                this.webhook = null;
            }
        }
        else {
            this.logger.warn("CLERK_WEBHOOK_SECRET not configured, webhook verification disabled");
            this.webhook = null;
        }
    }
    async handleClerkWebhook(payload, svixId, svixTimestamp, svixSignature) {
        try {
            let evt;
            if (this.webhook) {
                evt = this.webhook.verify(JSON.stringify(payload), {
                    "svix-id": svixId,
                    "svix-timestamp": svixTimestamp,
                    "svix-signature": svixSignature,
                });
            }
            else {
                evt = payload;
            }
            const { type, data } = evt;
            switch (type) {
                case "user.created":
                    await this.handleUserCreated(data);
                    break;
                case "user.updated":
                    await this.handleUserUpdated(data);
                    break;
                case "user.deleted":
                    await this.handleUserDeleted(data);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook type: ${type}`);
            }
        }
        catch (error) {
            this.logger.error("Failed to process webhook", error);
            throw error;
        }
    }
    async handleUserCreated(userData) {
        this.logger.log("Creating user from Clerk webhook", {
            userId: userData.id,
        });
        await this.usersService.createFromClerk({
            clerkId: userData.id,
            email: userData.email_addresses[0]?.email_address,
            firstName: userData.first_name,
            lastName: userData.last_name,
            imageUrl: userData.image_url,
        });
    }
    async handleUserUpdated(userData) {
        this.logger.log("Updating user from Clerk webhook", {
            userId: userData.id,
        });
        await this.usersService.updateFromClerk(userData.id, {
            email: userData.email_addresses[0]?.email_address,
            firstName: userData.first_name,
            lastName: userData.last_name,
            imageUrl: userData.image_url,
        });
    }
    async handleUserDeleted(userData) {
        this.logger.log("Deleting user from Clerk webhook", {
            userId: userData.id,
        });
        await this.usersService.deleteByClerkId(userData.id);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map