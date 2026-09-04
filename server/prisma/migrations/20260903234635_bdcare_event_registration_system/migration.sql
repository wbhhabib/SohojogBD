/*
  Warnings:

  - Made the column `district` on table `OrgUpdate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `division` on table `OrgUpdate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventDate` on table `OrgUpdate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `place` on table `OrgUpdate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `upazila` on table `OrgUpdate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "NotifType" ADD VALUE 'EVENT_REGISTRATION';

-- AlterTable
ALTER TABLE "OrgUpdate" ADD COLUMN     "capacity" INTEGER,
ALTER COLUMN "district" SET NOT NULL,
ALTER COLUMN "division" SET NOT NULL,
ALTER COLUMN "eventDate" SET NOT NULL,
ALTER COLUMN "place" SET NOT NULL,
ALTER COLUMN "upazila" SET NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerRequest" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "interestAreas" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "status" "VolunteerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT,
    "phone" TEXT,
    "guardianPhone" TEXT,
    "message" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_userId_eventId_key" ON "EventRegistration"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "OrgUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
