import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Headers,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FilesService, FileUploadDto } from "./files.service";

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Headers("x-user-id") clerkId: string,
    @Headers("x-message-id") messageId?: string
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (!clerkId) {
      throw new BadRequestException("User ID is required");
    }

    const fileUploadDto: FileUploadDto = {
      file: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      displayName: file.originalname,
      messageId: messageId,
    };

    return this.filesService.uploadFile(fileUploadDto, clerkId);
  }

  @Get("by-id/:fileId")
  async getFileById(
    @Param("fileId") fileId: string,
    @Headers("x-user-id") clerkId: string
  ) {
    if (!clerkId) {
      throw new BadRequestException("User ID is required");
    }
    return this.filesService.getFileById(fileId, clerkId);
  }

  @Get(":geminiFileId")
  async getFile(
    @Param("geminiFileId") geminiFileId: string,
    @Headers("x-user-id") clerkId: string
  ) {
    if (!clerkId) {
      throw new BadRequestException("User ID is required");
    }
    return this.filesService.getFile(geminiFileId, clerkId);
  }

  @Get(":geminiFileId/content")
  async getFileContent(
    @Param("geminiFileId") geminiFileId: string,
    @Headers("x-user-id") clerkId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!clerkId) {
      throw new BadRequestException("User ID is required");
    }

    try {
      const fileContent = await this.filesService.getFileContent(
        geminiFileId,
        clerkId
      );

      // Set appropriate headers
      res.set({
        "Content-Type": fileContent.mimeType,
        "Content-Length": fileContent.buffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin":
          process.env.FRONTEND_URL || "http://localhost:3000",
        "Access-Control-Allow-Headers": "x-user-id, Content-Type",
      });

      return new StreamableFile(fileContent.buffer);
    } catch (error) {
      console.error("Error serving file content:", error);
      throw error;
    }
  }

  @Get()
  async listFiles(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Headers("x-user-id") clerkId: string
  ) {
    if (!clerkId) {
      throw new BadRequestException("User ID is required");
    }
    return this.filesService.listFiles(
      clerkId,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Delete(":fileId")
  async deleteFile(
    @Param("fileId") fileId: string,
    @Headers("x-user-id") clerkId: string
  ) {
    if (!clerkId) {
      throw new BadRequestException("User ID is required");
    }
    return this.filesService.deleteFileById(fileId, clerkId);
  }

  @Post("cleanup")
  async cleanupExpiredFiles() {
    return this.filesService.cleanupExpiredFiles();
  }
}
