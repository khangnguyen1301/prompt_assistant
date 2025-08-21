-- AlterTable
ALTER TABLE "uploaded_files" ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "cloudinarySecureUrl" TEXT,
ADD COLUMN     "cloudinaryUrl" TEXT,
ALTER COLUMN "geminiFileId" DROP NOT NULL;
