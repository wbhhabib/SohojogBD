-- CreateEnum
CREATE TYPE "CourseProviderInstitutionType" AS ENUM ('GOVERNMENT_PROJECT', 'NGO', 'PRIVATE_COMPANY', 'UNIVERSITY_CLUB', 'INTERNATIONAL_ORG');

-- CreateEnum
CREATE TYPE "CourseProviderStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "CourseProvider" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "institutionType" "CourseProviderInstitutionType" NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "facebookPage" TEXT,
    "headquartersAddress" TEXT NOT NULL,
    "headquartersDivision" TEXT NOT NULL,
    "headquartersDistrict" TEXT NOT NULL,
    "headquartersUpazila" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "legalDocumentUrl" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "nidNumber" TEXT NOT NULL,
    "status" "CourseProviderStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "CourseProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseProviderBranch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT NOT NULL,
    "loginUserId" TEXT NOT NULL,
    CONSTRAINT "CourseProviderBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseProvider_ownerId_idx" ON "CourseProvider" ("ownerId");

-- CreateIndex
CREATE INDEX "CourseProvider_status_idx" ON "CourseProvider" ("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProviderBranch_loginUserId_key" ON "CourseProviderBranch" ("loginUserId");

-- CreateIndex
CREATE INDEX "CourseProviderBranch_providerId_idx" ON "CourseProviderBranch" ("providerId");

-- CreateIndex
CREATE INDEX "CourseProviderBranch_division_idx" ON "CourseProviderBranch" ("division");

-- CreateIndex
CREATE INDEX "CourseProviderBranch_district_idx" ON "CourseProviderBranch" ("district");

-- CreateIndex
CREATE INDEX "CourseProviderBranch_upazila_idx" ON "CourseProviderBranch" ("upazila");

-- AddForeignKey
ALTER TABLE "CourseProvider"
ADD CONSTRAINT "CourseProvider_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProviderBranch"
ADD CONSTRAINT "CourseProviderBranch_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CourseProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProviderBranch"
ADD CONSTRAINT "CourseProviderBranch_loginUserId_fkey" FOREIGN KEY ("loginUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────
-- Course: organizationId → branchId
--
-- ⚠️ BREAKING: this assumes the "Course" table currently has 0 rows.
-- Run `SELECT count(*) FROM "Course";` before applying this migration.
-- If it's not 0, do NOT run this as-is — a data migration is needed instead.
-- ─────────────────────────────────────────────────────────────────────────

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_organizationId_fkey";

-- DropIndex
DROP INDEX "Course_organizationId_idx";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "organizationId";

ALTER TABLE "Course" ADD COLUMN "branchId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Course_branchId_idx" ON "Course" ("branchId");

-- AddForeignKey
ALTER TABLE "Course"
ADD CONSTRAINT "Course_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CourseProviderBranch" ("id") ON DELETE CASCADE ON UPDATE CASCADE;