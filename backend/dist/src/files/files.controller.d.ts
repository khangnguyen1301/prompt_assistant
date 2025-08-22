import { StreamableFile } from "@nestjs/common";
import { Response } from "express";
import { FilesService } from "./files.service";
interface MulterFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: MulterFile, clerkId: string, messageId?: string): Promise<import("./files.service").UploadedFile>;
    getFileById(fileId: string, clerkId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    getFile(geminiFileId: string, clerkId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    getFileContent(geminiFileId: string, clerkId: string, res: Response): Promise<StreamableFile>;
    listFiles(page: string, limit: string, clerkId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }[]>;
    deleteFile(fileId: string, clerkId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanupExpiredFiles(): Promise<{
        cleaned: number;
    }>;
}
export {};
