import { WebhooksService } from "./webhooks.service";
export declare class WebhooksController {
    private readonly webhooksService;
    private readonly logger;
    constructor(webhooksService: WebhooksService);
    handleClerkWebhook(payload: any, svixId: string, svixTimestamp: string, svixSignature: string): Promise<{
        success: boolean;
    }>;
}
