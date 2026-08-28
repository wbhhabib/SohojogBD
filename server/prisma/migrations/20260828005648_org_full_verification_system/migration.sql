/*
  Warnings:

  - You are about to drop the column `location` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `fullAddress` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgType` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Organization` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `contactPhone` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OrgCategory" AS ENUM ('REGISTERED', 'TEAM');

-- CreateEnum
CREATE TYPE "OrgVerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InstitutionAffiliation" AS ENUM ('YES', 'NO', 'NOT_APPLICABLE');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "location",
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "facebookPage" TEXT,
ADD COLUMN     "fullAddress" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "orgType" TEXT NOT NULL,
ADD COLUMN     "orgTypeOther" TEXT,
ADD COLUMN     "otherSocialLinks" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "status" "OrgVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "upazila" TEXT,
ADD COLUMN     "website" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "OrgCategory" NOT NULL,
ALTER COLUMN "contactPhone" SET NOT NULL;

-- CreateTable
CREATE TABLE "AreaOfWork" (
    "id" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "areaOther" TEXT,
    "description" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "AreaOfWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRegistration" (
    "id" TEXT NOT NULL,
    "registrationAuthority" TEXT NOT NULL,
    "authorityOther" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrgRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgTeamEvidence" (
    "id" TEXT NOT NULL,
    "pastActivities" TEXT,
    "activityCount" INTEGER,
    "volunteerCountApprox" INTEGER,
    "recentActivity" TEXT,
    "photos" TEXT[],
    "activityReportUrl" TEXT,
    "facebookPageUrl" TEXT,
    "previousCampaignLinks" TEXT[],
    "supportingDocUrl" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrgTeamEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgInstitution" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "institutionType" TEXT NOT NULL,
    "department" TEXT,
    "clubName" TEXT,
    "advisorName" TEXT,
    "advisorContact" TEXT,
    "affiliated" "InstitutionAffiliation" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "authorizationDocUrl" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrgInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRepresentative" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "designationOther" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "nidNumber" TEXT NOT NULL,
    "nidDocUrl" TEXT,
    "authorizationDocUrl" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrgRepresentative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgVerificationLog" (
    "id" TEXT NOT NULL,
    "oldStatus" "OrgVerificationStatus",
    "newStatus" "OrgVerificationStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "OrgVerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AreaOfWork_organizationId_idx" ON "AreaOfWork"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgRegistration_organizationId_key" ON "OrgRegistration"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgTeamEvidence_organizationId_key" ON "OrgTeamEvidence"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgInstitution_organizationId_key" ON "OrgInstitution"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgRepresentative_organizationId_key" ON "OrgRepresentative"("organizationId");

-- CreateIndex
CREATE INDEX "OrgVerificationLog_organizationId_idx" ON "OrgVerificationLog"("organizationId");

-- CreateIndex
CREATE INDEX "Organization_category_idx" ON "Organization"("category");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- AddForeignKey
ALTER TABLE "AreaOfWork" ADD CONSTRAINT "AreaOfWork_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRegistration" ADD CONSTRAINT "OrgRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgTeamEvidence" ADD CONSTRAINT "OrgTeamEvidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgInstitution" ADD CONSTRAINT "OrgInstitution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRepresentative" ADD CONSTRAINT "OrgRepresentative_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgVerificationLog" ADD CONSTRAINT "OrgVerificationLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgVerificationLog" ADD CONSTRAINT "OrgVerificationLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
