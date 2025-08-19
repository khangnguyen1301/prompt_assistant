import { ConfigService } from "@nestjs/config";
import { UsersService } from "@/users/users.service";
export declare class WebhooksService {
    private readonly configService;
    private readonly usersService;
    private readonly logger;
    private readonly webhook;
    constructor(configService: ConfigService, usersService: UsersService);
    handleClerkWebhook(payload: any, svixId: string, svixTimestamp: string, svixSignature: string): Promise<void>;
    private handleUserCreated;
    private handleUserUpdated;
    private handleUserDeleted;
}
