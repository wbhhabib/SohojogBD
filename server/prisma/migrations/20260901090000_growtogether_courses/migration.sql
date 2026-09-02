-- CreateEnum
CREATE TYPE "CourseMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillCategory" TEXT NOT NULL,
    "mode" "CourseMode" NOT NULL,
    "duration" TEXT NOT NULL,
    "eligibility" TEXT,
    "division" TEXT,
    "district" TEXT,
    "upazila" TEXT,
    "startDate" TIMESTAMP(3),
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "seatsAvailable" INTEGER,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "applyLink" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course" ("slug");

-- CreateIndex
CREATE INDEX "Course_organizationId_idx" ON "Course" ("organizationId");

-- CreateIndex
CREATE INDEX "Course_skillCategory_idx" ON "Course" ("skillCategory");

-- CreateIndex
CREATE INDEX "Course_mode_idx" ON "Course" ("mode");

-- CreateIndex
CREATE INDEX "Course_division_idx" ON "Course" ("division");

-- CreateIndex
CREATE INDEX "Course_district_idx" ON "Course" ("district");

-- CreateIndex
CREATE INDEX "Course_upazila_idx" ON "Course" ("upazila");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course" ("status");

-- CreateIndex
CREATE INDEX "Course_slug_idx" ON "Course" ("slug");

-- AddForeignKey
ALTER TABLE "Course"
ADD CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE;