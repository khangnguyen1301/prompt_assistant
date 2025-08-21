import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadFile(
    buffer: Buffer,
    options: {
      fileName: string;
      mimeType: string;
      folder?: string;
      userId?: string;
      messageId?: string;
      public_id?: string;
      resource_type?: "auto" | "image" | "video" | "raw";
    }
  ): Promise<{
    public_id: string;
    secure_url: string;
    url: string;
    bytes: number;
    format: string;
    resource_type: string;
    created_at: string;
  }> {
    try {
      // Determine resource type based on mime type
      let resourceType: "auto" | "image" | "video" | "raw" = "auto";
      if (options.mimeType.startsWith("image/")) {
        resourceType = "image";
      } else if (options.mimeType.startsWith("video/")) {
        resourceType = "video";
      } else {
        resourceType = "raw"; // For documents, audio, etc.
      }

      // Create folder structure: files/{userId}/{messageId}/
      const folderPath =
        options.folder ||
        `files/${options.userId || "unknown"}/${options.messageId || "general"}`;

      // Generate unique public_id
      const timestamp = Date.now();
      const publicId = `${folderPath}/${timestamp}_${options.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Build context object with only defined values
      const contextData: Record<string, string> = {};
      if (options.userId) contextData.user_id = options.userId;
      if (options.messageId) contextData.message_id = options.messageId;
      if (options.fileName) contextData.original_name = options.fileName;
      if (options.mimeType) contextData.mime_type = options.mimeType;

      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: resourceType,
              public_id: publicId,
              folder: folderPath,
              use_filename: true,
              unique_filename: true,
              overwrite: false,
              // Add metadata only if we have context data
              ...(Object.keys(contextData).length > 0 && {
                context: contextData,
              }),
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(
                  new InternalServerErrorException(
                    "Failed to upload file to Cloudinary"
                  )
                );
              } else if (result) {
                resolve({
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                  url: result.url,
                  bytes: result.bytes,
                  format: result.format,
                  resource_type: result.resource_type,
                  created_at: result.created_at,
                });
              } else {
                reject(
                  new InternalServerErrorException(
                    "Unexpected error during upload"
                  )
                );
              }
            }
          )
          .end(buffer);
      });
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      throw new InternalServerErrorException("Failed to upload file");
    }
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Cloudinary delete error:", error);
            reject(
              new InternalServerErrorException(
                "Failed to delete file from Cloudinary"
              )
            );
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
      throw new InternalServerErrorException("Failed to delete file");
    }
  }

  async getFileInfo(publicId: string): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.api.resource(publicId, (error, result) => {
          if (error) {
            console.error("Cloudinary get file info error:", error);
            reject(
              new InternalServerErrorException(
                "Failed to get file info from Cloudinary"
              )
            );
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error("Error getting file info from Cloudinary:", error);
      throw new InternalServerErrorException("Failed to get file info");
    }
  }

  /**
   * Generate optimized URL for image delivery
   */
  getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
      crop?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      width: options.width,
      height: options.height,
      quality: options.quality || "auto",
      format: options.format || "auto",
      crop: options.crop || "limit",
      secure: true,
    });
  }

  /**
   * Generate download URL for files
   */
  getDownloadUrl(publicId: string, fileName?: string): string {
    return cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      attachment: fileName || true,
      secure: true,
    });
  }
}
