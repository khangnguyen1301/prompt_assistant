import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "./cloudinary.service";
export interface UploadedFile {
    id: string;
    name: string;
    deleteFileById(fileId: string, clerkId: string): any;
}
export interface FileUploadDto {
    file: Buffer;
    fileName: string;
    mimeType: string;
    displayName?: string;
    messageId?: string;
}
export declare class FilesService {
    private readonly prisma;
    private readonly configService;
    private readonly cloudinaryService;
    private ai;
    constructor(prisma: PrismaService, configService: ConfigService, cloudinaryService: CloudinaryService);
    uploadFile(fileData: FileUploadDto, clerkId: string): Promise<UploadedFile>;
    getFile(geminiFileId: string, clerkId: string): Promise<{
        geminiInfo: import("@google/genai").File;
        id: string;
        userId: string;
        messageId: string | null;
        geminiFileId: string | null;
        originalName: string;
        displayName: string;
        mimeType: string;
        sizeBytes: number;
        uri: string;
        sha256Hash: string;
        state: string;
        expirationTime: Date | null;
        cloudinaryPublicId: string | null;
        cloudinaryUrl: string | null;
        cloudinarySecureUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getFileContent(geminiFileId: string, clerkId: string): Promise<{
        buffer: Buffer<ArrayBuffer>;
        mimeType: string;
        size: number;
        fileName: string;
    }>;
    listUserFiles(clerkId: string, page?: number, limit?: number): Promise<{
        files: {
            id: string;
            userId: string;
            messageId: string | null;
            geminiFileId: string | null;
            originalName: string;
            displayName: string;
            mimeType: string;
            sizeBytes: number;
            uri: string;
            sha256Hash: string;
            state: string;
            expirationTime: Date | null;
            cloudinaryPublicId: string | null;
            cloudinaryUrl: string | null;
            cloudinarySecureUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    deleteFile(geminiFileId: string, clerkId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanupExpiredFiles(): Promise<{
        cleaned: number;
    }>;
}
