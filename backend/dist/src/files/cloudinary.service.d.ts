import { ConfigService } from "@nestjs/config";
export declare class CloudinaryService {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(buffer: Buffer, options: {
        fileName: string;
        mimeType: string;
        folder?: string;
        userId?: string;
        messageId?: string;
        public_id?: string;
        resource_type?: "auto" | "image" | "video" | "raw";
    }): Promise<{
        public_id: string;
        secure_url: string;
        url: string;
        bytes: number;
        format: string;
        resource_type: string;
        created_at: string;
    }>;
    deleteFile(publicId: string): Promise<{
        result: string;
    }>;
    getFileInfo(publicId: string): Promise<any>;
    getOptimizedImageUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        quality?: string;
        format?: string;
        crop?: string;
    }): string;
    getDownloadUrl(publicId: string, fileName?: string): string;
}
