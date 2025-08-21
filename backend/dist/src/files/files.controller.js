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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFile(file, clerkId, messageId) {
        if (!file) {
            throw new common_1.BadRequestException("No file provided");
        }
        if (!clerkId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        const fileUploadDto = {
            file: file.buffer,
            fileName: file.originalname,
            mimeType: file.mimetype,
            displayName: file.originalname,
            messageId: messageId,
        };
        return this.filesService.uploadFile(fileUploadDto, clerkId);
    }
    async getFileById(fileId, clerkId) {
        if (!clerkId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        return this.filesService.getFileById(fileId, clerkId);
    }
    async getFile(geminiFileId, clerkId) {
        if (!clerkId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        return this.filesService.getFile(geminiFileId, clerkId);
    }
    async getFileContent(geminiFileId, clerkId, res) {
        if (!clerkId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        try {
            const fileContent = await this.filesService.getFileContent(geminiFileId, clerkId);
            res.set({
                "Content-Type": fileContent.mimeType,
                "Content-Length": fileContent.buffer.length.toString(),
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:3000",
                "Access-Control-Allow-Headers": "x-user-id, Content-Type",
            });
            return new common_1.StreamableFile(fileContent.buffer);
        }
        catch (error) {
            console.error("Error serving file content:", error);
            throw error;
        }
    }
    async listFiles(page = "1", limit = "20", clerkId) {
        if (!clerkId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        return this.filesService.listFiles(clerkId, parseInt(page), parseInt(limit));
    }
    async deleteFile(fileId, clerkId) {
        if (!clerkId) {
            throw new common_1.BadRequestException("User ID is required");
        }
        return this.filesService.deleteFileById(fileId, clerkId);
    }
    async cleanupExpiredFiles() {
        return this.filesService.cleanupExpiredFiles();
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)("upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __param(2, (0, common_1.Headers)("x-message-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)("by-id/:fileId"),
    __param(0, (0, common_1.Param)("fileId")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileById", null);
__decorate([
    (0, common_1.Get)(":geminiFileId"),
    __param(0, (0, common_1.Param)("geminiFileId")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)(":geminiFileId/content"),
    __param(0, (0, common_1.Param)("geminiFileId")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileContent", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Delete)(":fileId"),
    __param(0, (0, common_1.Param)("fileId")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)("cleanup"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "cleanupExpiredFiles", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)("files"),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map