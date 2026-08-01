-- CreateEnum
CREATE TYPE "PlantListingStatus" AS ENUM ('AVAILABLE', 'CLAIMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlantClaimStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable


CREATE TABLE "PlantListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plantType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "images" TEXT[],
    "location" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" "PlantListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "PlantListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantClaim" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "status" "PlantClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "claimantId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    CONSTRAINT "PlantClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlantListing_slug_key" ON "PlantListing" ("slug");

-- CreateIndex
CREATE INDEX "PlantListing_ownerId_idx" ON "PlantListing" ("ownerId");

-- CreateIndex
CREATE INDEX "PlantListing_status_idx" ON "PlantListing" ("status");

-- CreateIndex
CREATE INDEX "PlantListing_plantType_idx" ON "PlantListing" ("plantType");

-- CreateIndex
CREATE INDEX "PlantListing_slug_idx" ON "PlantListing" ("slug");

-- CreateIndex
CREATE INDEX "PlantClaim_listingId_idx" ON "PlantClaim" ("listingId");

-- CreateIndex
CREATE INDEX "PlantClaim_claimantId_idx" ON "PlantClaim" ("claimantId");

-- CreateIndex
CREATE INDEX "PlantClaim_status_idx" ON "PlantClaim" ("status");

-- AddForeignKey
ALTER TABLE "PlantListing"
ADD CONSTRAINT "PlantListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantClaim"
ADD CONSTRAINT "PlantClaim_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantClaim"
ADD CONSTRAINT "PlantClaim_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PlantListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE;