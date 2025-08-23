import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { CloudinaryService } from "./cloudinary.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SettingsModule } from "@/settings/settings.module";

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
      },
    }),
    SettingsModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, CloudinaryService],
  exports: [FilesService, CloudinaryService],
})
export class FilesModule {}
