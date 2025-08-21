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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const genai_1 = require("@google/genai");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("./cloudinary.service");
let FilesService = class FilesService {
    constructor(prisma, configService, cloudinaryService) {
        this.prisma = prisma;
        this.configService = configService;
        this.cloudinaryService = cloudinaryService;
        const apiKey = this.configService.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    async uploadFile(fileData, clerkId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            const maxSize = 20 * 1024 * 1024;
            if (fileData.file.length > maxSize) {
                throw new common_1.BadRequestException("File size exceeds 20MB limit");
            }
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "video/mp4",
                "video/mpeg",
                "video/quicktime",
                "audio/mp3",
                "audio/wav",
                "audio/aac",
                "application/pdf",
                "text/plain",
                "text/csv",
                "application/json",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];
            if (!allowedTypes.includes(fileData.mimeType)) {
                throw new common_1.BadRequestException("Unsupported file type");
            }
            const cloudinaryResult = await this.cloudinaryService.uploadFile(fileData.file, {
                fileName: fileData.fileName,
                mimeType: fileData.mimeType,
                userId: user.id,
                messageId: fileData.messageId || undefined,
                resource_type: "auto",
            });
            let geminiFileId = null;
            let geminiUri = null;
            let geminiSha256Hash = "";
            let geminiState = "ACTIVE";
            let geminiExpirationTime = null;
            try {
                const uint8Array = new Uint8Array(fileData.file);
                const blob = new Blob([uint8Array], { type: fileData.mimeType });
                const uploadResult = await this.ai.files.upload({
                    file: blob,
                    config: {
                        mimeType: fileData.mimeType,
                        displayName: fileData.displayName || fileData.fileName,
                    },
                });
                geminiFileId = uploadResult.name;
                geminiUri = uploadResult.uri;
                geminiSha256Hash = uploadResult.sha256Hash || "";
                geminiState = uploadResult.state || "ACTIVE";
                geminiExpirationTime = uploadResult.expirationTime
                    ? new Date(uploadResult.expirationTime)
                    : null;
            }
            catch (geminiError) {
                console.warn("Failed to upload to Gemini Files API, using Cloudinary only:", geminiError);
                geminiUri = cloudinaryResult.secure_url;
            }
            const savedFile = await this.prisma.uploadedFile.create({
                data: {
                    userId: user.id,
                    messageId: fileData.messageId || null,
                    geminiFileId: geminiFileId,
                    originalName: fileData.fileName,
                    displayName: fileData.displayName || fileData.fileName,
                    mimeType: fileData.mimeType,
                    sizeBytes: fileData.file.length,
                    uri: geminiUri || cloudinaryResult.secure_url,
                    sha256Hash: geminiSha256Hash,
                    state: geminiState,
                    expirationTime: geminiExpirationTime,
                    cloudinaryPublicId: cloudinaryResult.public_id,
                    cloudinaryUrl: cloudinaryResult.url,
                    cloudinarySecureUrl: cloudinaryResult.secure_url,
                },
            });
            return {
                id: savedFile.id,
                name: geminiFileId || cloudinaryResult.public_id,
                uri: savedFile.uri,
                mimeType: fileData.mimeType,
                sizeBytes: fileData.file.length,
                createTime: savedFile.createdAt.toISOString(),
                expirationTime: geminiExpirationTime?.toISOString() || "",
                sha256Hash: geminiSha256Hash,
                state: geminiState,
                cloudinaryUrl: cloudinaryResult.url,
                cloudinarySecureUrl: cloudinaryResult.secure_url,
            };
        }
        catch (error) {
            console.error("Error uploading file:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Failed to upload file");
        }
    }
    async deleteFileById(fileId, clerkId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            const fileRecord = (await this.prisma.uploadedFile.findFirst({
                where: {
                    id: fileId,
                    userId: user.id,
                },
            }));
            if (!fileRecord) {
                throw new common_1.BadRequestException("File not found or access denied");
            }
            if (fileRecord.cloudinaryPublicId) {
                try {
                    await this.cloudinaryService.deleteFile(fileRecord.cloudinaryPublicId);
                }
                catch (error) {
                    console.warn("Failed to delete from Cloudinary:", error);
                }
            }
            if (fileRecord.geminiFileId) {
                try {
                    await this.ai.files.delete({ name: fileRecord.geminiFileId });
                }
                catch (error) {
                    console.warn("Failed to delete from Gemini:", error);
                }
            }
            await this.prisma.uploadedFile.delete({
                where: { id: fileId },
            });
            return {
                success: true,
                message: "File deleted successfully",
            };
        }
        catch (error) {
            console.error("Error deleting file:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Failed to delete file");
        }
    }
    async getFileById(fileId, clerkId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            const fileRecord = await this.prisma.uploadedFile.findFirst({
                where: {
                    id: fileId,
                    userId: user.id,
                },
            });
            if (!fileRecord) {
                throw new common_1.BadRequestException("File not found or access denied");
            }
            return fileRecord;
        }
        catch (error) {
            console.error("Error getting file by ID:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Failed to get file");
        }
    }
    async getFile(geminiFileId, clerkId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            const fileRecord = await this.prisma.uploadedFile.findFirst({
                where: {
                    geminiFileId: `files/${geminiFileId}`,
                    userId: user.id,
                },
            });
            if (!fileRecord) {
                throw new common_1.BadRequestException("File not found or access denied");
            }
            return fileRecord;
        }
        catch (error) {
            console.error("Error getting file:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Failed to get file");
        }
    }
    async getFileContent(geminiFileId, clerkId) {
        try {
            const fileRecord = (await this.getFile(geminiFileId, clerkId));
            if (fileRecord.geminiFileId) {
                try {
                    const file = await this.ai.files.get({
                        name: fileRecord.geminiFileId,
                    });
                    const response = await fetch(file.uri, {
                        headers: {
                            Authorization: `Bearer ${this.configService.get("GEMINI_API_KEY")}`,
                        },
                    });
                    if (response.ok) {
                        return {
                            buffer: Buffer.from(await response.arrayBuffer()),
                            mimeType: fileRecord.mimeType,
                            filename: fileRecord.originalName,
                        };
                    }
                }
                catch (geminiError) {
                    console.warn("Failed to get from Gemini, trying Cloudinary:", geminiError);
                }
            }
            if (fileRecord.cloudinarySecureUrl) {
                const response = await fetch(fileRecord.cloudinarySecureUrl);
                if (response.ok) {
                    return {
                        buffer: Buffer.from(await response.arrayBuffer()),
                        mimeType: fileRecord.mimeType,
                        filename: fileRecord.originalName,
                    };
                }
            }
            throw new Error("File content not accessible");
        }
        catch (error) {
            console.error("Error getting file content:", error);
            throw new common_1.InternalServerErrorException("Failed to get file content");
        }
    }
    async listFiles(clerkId, limit = 50, offset = 0) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            const files = await this.prisma.uploadedFile.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            });
            return files;
        }
        catch (error) {
            console.error("Error listing files:", error);
            throw new common_1.InternalServerErrorException("Failed to list files");
        }
    }
    async deleteFile(geminiFileId, clerkId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });
            if (!user) {
                throw new common_1.BadRequestException("User not found");
            }
            const fileRecord = await this.prisma.uploadedFile.findFirst({
                where: {
                    geminiFileId,
                    userId: user.id,
                },
            });
            if (!fileRecord) {
                throw new common_1.BadRequestException("File not found or access denied");
            }
            await this.ai.files.delete({ name: geminiFileId });
            await this.prisma.uploadedFile.delete({
                where: { id: fileRecord.id },
            });
            return { success: true, message: "File deleted successfully" };
        }
        catch (error) {
            console.error("Error deleting file:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Failed to delete file");
        }
    }
    async cleanupExpiredFiles() {
        try {
            const expiredFiles = await this.prisma.uploadedFile.findMany({
                where: {
                    expirationTime: {
                        lt: new Date(),
                    },
                },
            });
            for (const file of expiredFiles) {
                try {
                    if (file.geminiFileId) {
                        await this.ai.files.delete({ name: file.geminiFileId });
                    }
                }
                catch (error) {
                    console.log(`File ${file.geminiFileId} already deleted from Gemini`);
                }
                await this.prisma.uploadedFile.delete({
                    where: { id: file.id },
                });
            }
            return { cleaned: expiredFiles.length };
        }
        catch (error) {
            console.error("Error cleaning up expired files:", error);
            throw new common_1.InternalServerErrorException("Failed to cleanup expired files");
        }
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        cloudinary_service_1.CloudinaryService])
], FilesService);
//# sourceMappingURL=files.service.js.map