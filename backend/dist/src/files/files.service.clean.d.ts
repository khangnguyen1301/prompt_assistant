import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "./cloudinary.service";
export interface UploadedFile {
    id: string;
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes: number;
    createTime: string;
    expirationTime: string;
    sha256Hash: string;
    state: string;
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
    deleteFileById(fileId: string, clerkId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFile(geminiFileId: string, clerkId: string): Promise<{
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
        filename: string;
    }>;
    listFiles(clerkId: string, limit?: number, offset?: number): Promise<{
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
    }[]>;
    deleteFile(geminiFileId: string, clerkId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanupExpiredFiles(): Promise<{
        cleaned: number;
    }>;
}
