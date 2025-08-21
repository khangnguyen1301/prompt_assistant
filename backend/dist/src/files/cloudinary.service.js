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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get("CLOUDINARY_CLOUD_NAME"),
            api_key: this.configService.get("CLOUDINARY_API_KEY"),
            api_secret: this.configService.get("CLOUDINARY_API_SECRET"),
        });
    }
    async uploadFile(buffer, options) {
        try {
            let resourceType = "auto";
            if (options.mimeType.startsWith("image/")) {
                resourceType = "image";
            }
            else if (options.mimeType.startsWith("video/")) {
                resourceType = "video";
            }
            else {
                resourceType = "raw";
            }
            const folderPath = options.folder ||
                `files/${options.userId || "unknown"}/${options.messageId || "general"}`;
            const timestamp = Date.now();
            const publicId = `${folderPath}/${timestamp}_${options.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const contextData = {};
            if (options.userId)
                contextData.user_id = options.userId;
            if (options.messageId)
                contextData.message_id = options.messageId;
            if (options.fileName)
                contextData.original_name = options.fileName;
            if (options.mimeType)
                contextData.mime_type = options.mimeType;
            return new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader
                    .upload_stream({
                    resource_type: resourceType,
                    public_id: publicId,
                    folder: folderPath,
                    use_filename: true,
                    unique_filename: true,
                    overwrite: false,
                    ...(Object.keys(contextData).length > 0 && {
                        context: contextData,
                    }),
                }, (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(new common_1.InternalServerErrorException("Failed to upload file to Cloudinary"));
                    }
                    else if (result) {
                        resolve({
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                            url: result.url,
                            bytes: result.bytes,
                            format: result.format,
                            resource_type: result.resource_type,
                            created_at: result.created_at,
                        });
                    }
                    else {
                        reject(new common_1.InternalServerErrorException("Unexpected error during upload"));
                    }
                })
                    .end(buffer);
            });
        }
        catch (error) {
            console.error("Error uploading file to Cloudinary:", error);
            throw new common_1.InternalServerErrorException("Failed to upload file");
        }
    }
    async deleteFile(publicId) {
        try {
            return new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
                    if (error) {
                        console.error("Cloudinary delete error:", error);
                        reject(new common_1.InternalServerErrorException("Failed to delete file from Cloudinary"));
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        }
        catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
            throw new common_1.InternalServerErrorException("Failed to delete file");
        }
    }
    async getFileInfo(publicId) {
        try {
            return new Promise((resolve, reject) => {
                cloudinary_1.v2.api.resource(publicId, (error, result) => {
                    if (error) {
                        console.error("Cloudinary get file info error:", error);
                        reject(new common_1.InternalServerErrorException("Failed to get file info from Cloudinary"));
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        }
        catch (error) {
            console.error("Error getting file info from Cloudinary:", error);
            throw new common_1.InternalServerErrorException("Failed to get file info");
        }
    }
    getOptimizedImageUrl(publicId, options = {}) {
        return cloudinary_1.v2.url(publicId, {
            width: options.width,
            height: options.height,
            quality: options.quality || "auto",
            format: options.format || "auto",
            crop: options.crop || "limit",
            secure: true,
        });
    }
    getDownloadUrl(publicId, fileName) {
        return cloudinary_1.v2.url(publicId, {
            resource_type: "raw",
            type: "upload",
            attachment: fileName || true,
            secure: true,
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map