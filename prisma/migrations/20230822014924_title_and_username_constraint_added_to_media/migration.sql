/*
  Warnings:

  - A unique constraint covering the columns `[title,username]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Media_title_username_key" ON "Media"("title", "username");
