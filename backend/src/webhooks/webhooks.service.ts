import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Webhook } from "svix";
import { UsersService } from "@/users/users.service";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhook: Webhook;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    const webhookSecret = this.configService.get("CLERK_WEBHOOK_SECRET");

    // Only initialize webhook if secret is properly configured
    if (webhookSecret && webhookSecret !== "your-clerk-webhook-secret") {
      try {
        this.webhook = new Webhook(webhookSecret);
      } catch (error) {
        this.logger.warn(
          "Failed to initialize webhook, using mock verification:",
          error.message
        );
        this.webhook = null;
      }
    } else {
      this.logger.warn(
        "CLERK_WEBHOOK_SECRET not configured, webhook verification disabled"
      );
      this.webhook = null;
    }
  }

  async handleClerkWebhook(
    payload: any,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string
  ) {
    try {
      // Verify the webhook signature
      let evt: any;
      if (this.webhook) {
        evt = this.webhook.verify(JSON.stringify(payload), {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } else {
        // Skip verification if webhook not configured
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
    } catch (error) {
      this.logger.error("Failed to process webhook", error);
      throw error;
    }
  }

  private async handleUserCreated(userData: any) {
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

  private async handleUserUpdated(userData: any) {
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

  private async handleUserDeleted(userData: any) {
    this.logger.log("Deleting user from Clerk webhook", {
      userId: userData.id,
    });
    await this.usersService.deleteByClerkId(userData.id);
  }
}
