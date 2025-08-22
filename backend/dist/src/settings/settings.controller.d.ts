import { SettingsService } from "./settings.service";
export interface UpdateApiKeyDto {
    apiKey: string;
}
export interface ApiKeyStatusDto {
    hasApiKey: boolean;
    isValid?: boolean;
    lastValidated?: Date;
}
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getApiKeyStatus(req: any): Promise<ApiKeyStatusDto>;
    updateApiKey(req: any, body: UpdateApiKeyDto): Promise<{
        success: boolean;
        message: string;
    }>;
    validateApiKey(req: any): Promise<{
        isValid: boolean;
        message: string;
    }>;
}
