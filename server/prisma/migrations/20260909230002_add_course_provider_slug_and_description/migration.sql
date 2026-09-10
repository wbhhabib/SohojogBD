/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `CourseProvider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseProvider" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourseProvider_slug_key" ON "CourseProvider"("slug");

-- CreateIndex
CREATE INDEX "CourseProvider_slug_idx" ON "CourseProvider"("slug");
