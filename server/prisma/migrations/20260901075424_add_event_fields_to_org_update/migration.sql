-- AlterTable
ALTER TABLE "OrgUpdate" ADD COLUMN     "district" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "place" TEXT,
ADD COLUMN     "upazila" TEXT;

-- CreateIndex
CREATE INDEX "OrgUpdate_division_district_idx" ON "OrgUpdate"("division", "district");
