import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { WebhooksService } from "./webhooks.service";

@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("clerk")
  @ApiOperation({ summary: "Handle Clerk webhook events" })
  async handleClerkWebhook(
    @Body() payload: any,
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string
  ) {
    try {
      this.logger.log("Received Clerk webhook", { type: payload.type });

      await this.webhooksService.handleClerkWebhook(
        payload,
        svixId,
        svixTimestamp,
        svixSignature
      );

      return { success: true };
    } catch (error) {
      this.logger.error("Webhook processing failed", error);
      throw new BadRequestException("Webhook processing failed");
    }
  }
}
