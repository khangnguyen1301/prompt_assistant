import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "./cloudinary.service";
import { SettingsService } from "@/settings/settings.service";

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
  cloudinaryPublicId?: string | null;
  cloudinaryUrl?: string | null;
  cloudinarySecureUrl?: string | null;
}

export interface FileUploadDto {
  file: Buffer;
  fileName: string;
  mimeType: string;
  displayName?: string;
  messageId?: string;
}

// Extended interface for database records with Cloudinary fields
interface ExtendedFileRecord {
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
  createdAt: Date;
  updatedAt: Date;
  cloudinaryPublicId?: string | null;
  cloudinaryUrl?: string | null;
  cloudinarySecureUrl?: string | null;
}

@Injectable()
export class FilesService {
  private ai: GoogleGenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly settingsService: SettingsService
  ) {}

  /**
   * Upload file to both Cloudinary and Gemini Files API
   * @param fileData File upload data
   * @param clerkId User's Clerk ID
   * @returns Uploaded file information
   */
  async uploadFile(
    fileData: FileUploadDto,
    clerkId: string
  ): Promise<UploadedFile> {
    try {
      // Validate user
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }
      // Get user's API key from database
      const userApiKey = await this.settingsService.getUserApiKey(user.id);

      if (!userApiKey) {
        throw new BadRequestException(
          "No Gemini API key configured. Please add your API key in settings."
        );
      }

      // Create AI instance with user's API key
      this.ai = new GoogleGenAI({ apiKey: userApiKey });

      // Validate file size (max 20MB for Gemini Files API)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (fileData.file.length > maxSize) {
        throw new BadRequestException("File size exceeds 20MB limit");
      }

      // Validate mime type
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
        throw new BadRequestException("Unsupported file type");
      }

      // Upload to Cloudinary first (more reliable)
      const cloudinaryResult = await this.cloudinaryService.uploadFile(
        fileData.file,
        {
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          userId: user.id,
          messageId: fileData.messageId || undefined,
          resource_type: "auto",
        }
      );

      let geminiFileId = null;
      let geminiUri = null;
      let geminiSha256Hash = "";
      let geminiState = "ACTIVE";
      let geminiExpirationTime = null;

      // Try to upload to Gemini Files API (for AI processing)
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
      } catch (geminiError) {
        console.warn(
          "Failed to upload to Gemini Files API, using Cloudinary only:",
          geminiError
        );
        geminiUri = cloudinaryResult.secure_url;
      }

      // Save file record to database
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
        } as any, // Temporary type assertion for new fields
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
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to upload file");
    }
  }

  /**
   * Delete file by file ID (from database)
   * @param fileId Database file ID
   * @param clerkId User's Clerk ID
   */
  async deleteFileById(fileId: string, clerkId: string) {
    try {
      // Validate user
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      // Find file record
      const fileRecord = (await this.prisma.uploadedFile.findFirst({
        where: {
          id: fileId,
          userId: user.id,
        },
      })) as ExtendedFileRecord | null;

      if (!fileRecord) {
        throw new BadRequestException("File not found or access denied");
      }

      // Delete from Cloudinary if exists
      if (fileRecord.cloudinaryPublicId) {
        try {
          await this.cloudinaryService.deleteFile(
            fileRecord.cloudinaryPublicId
          );
        } catch (error) {
          console.warn("Failed to delete from Cloudinary:", error);
        }
      }

      // Delete from Gemini API if exists
      if (fileRecord.geminiFileId) {
        try {
          await this.ai.files.delete({ name: fileRecord.geminiFileId });
        } catch (error) {
          console.warn("Failed to delete from Gemini:", error);
        }
      }

      // Delete from database
      await this.prisma.uploadedFile.delete({
        where: { id: fileId },
      });

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting file:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to delete file");
    }
  }

  /**
   * Get file information by database file ID
   */
  async getFileById(fileId: string, clerkId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const fileRecord = await this.prisma.uploadedFile.findFirst({
        where: {
          id: fileId,
          userId: user.id,
        },
      });

      if (!fileRecord) {
        throw new BadRequestException("File not found or access denied");
      }

      return fileRecord;
    } catch (error) {
      console.error("Error getting file by ID:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to get file");
    }
  }

  /**
   * Get file information by Gemini file ID
   */
  async getFile(geminiFileId: string, clerkId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const fileRecord = await this.prisma.uploadedFile.findFirst({
        where: {
          geminiFileId: `files/${geminiFileId}`,
          userId: user.id,
        },
      });

      if (!fileRecord) {
        throw new BadRequestException("File not found or access denied");
      }

      return fileRecord;
    } catch (error) {
      console.error("Error getting file:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to get file");
    }
  }

  /**
   * Get file content by Gemini file ID
   */
  async getFileContent(geminiFileId: string, clerkId: string) {
    try {
      const fileRecord = (await this.getFile(
        geminiFileId,
        clerkId
      )) as ExtendedFileRecord;

      // Try to get from Gemini first
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
        } catch (geminiError) {
          console.warn(
            "Failed to get from Gemini, trying Cloudinary:",
            geminiError
          );
        }
      }

      // Fallback to Cloudinary
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
    } catch (error) {
      console.error("Error getting file content:", error);
      throw new InternalServerErrorException("Failed to get file content");
    }
  }

  /**
   * List files for a user
   */
  async listFiles(clerkId: string, limit = 50, offset = 0) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const files = await this.prisma.uploadedFile.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      throw new InternalServerErrorException("Failed to list files");
    }
  }

  /**
   * Delete file by Gemini file ID (legacy method)
   */
  async deleteFile(geminiFileId: string, clerkId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const fileRecord = await this.prisma.uploadedFile.findFirst({
        where: {
          geminiFileId,
          userId: user.id,
        },
      });

      if (!fileRecord) {
        throw new BadRequestException("File not found or access denied");
      }

      // Delete from Gemini API
      await this.ai.files.delete({ name: geminiFileId });

      // Delete from database
      await this.prisma.uploadedFile.delete({
        where: { id: fileRecord.id },
      });

      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      console.error("Error deleting file:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to delete file");
    }
  }

  /**
   * Clean up expired files
   */
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
        } catch (error) {
          console.log(`File ${file.geminiFileId} already deleted from Gemini`);
        }

        await this.prisma.uploadedFile.delete({
          where: { id: file.id },
        });
      }

      return { cleaned: expiredFiles.length };
    } catch (error) {
      console.error("Error cleaning up expired files:", error);
      throw new InternalServerErrorException("Failed to cleanup expired files");
    }
  }
}
