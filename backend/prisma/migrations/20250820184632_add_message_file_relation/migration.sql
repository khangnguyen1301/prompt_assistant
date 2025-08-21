-- AlterTable
ALTER TABLE "uploaded_files" ADD COLUMN     "messageId" TEXT;

-- CreateIndex
CREATE INDEX "uploaded_files_messageId_idx" ON "uploaded_files"("messageId");

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
