-- CreateEnum
CREATE TYPE "PoolStatus" AS ENUM ('OPEN', 'TARGET_REACHED', 'CLOSED', 'CANCELLED');

-- CreateTable


CREATE TABLE "WholesalePool" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "targetQuantity" INTEGER NOT NULL,
    "minJoinQuantity" INTEGER NOT NULL DEFAULT 1,
    "pricePerUnit" INTEGER NOT NULL,
    "marketPricePerUnit" INTEGER,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "groupLink" TEXT,
    "images" TEXT[],
    "status" "PoolStatus" NOT NULL DEFAULT 'OPEN',
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "WholesalePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolParticipant" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poolId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    CONSTRAINT "PoolParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WholesalePool_slug_key" ON "WholesalePool" ("slug");

-- CreateIndex
CREATE INDEX "WholesalePool_ownerId_idx" ON "WholesalePool" ("ownerId");

-- CreateIndex
CREATE INDEX "WholesalePool_status_idx" ON "WholesalePool" ("status");

-- CreateIndex
CREATE INDEX "WholesalePool_category_idx" ON "WholesalePool" ("category");

-- CreateIndex
CREATE INDEX "WholesalePool_division_idx" ON "WholesalePool" ("division");

-- CreateIndex
CREATE INDEX "WholesalePool_district_idx" ON "WholesalePool" ("district");

-- CreateIndex
CREATE INDEX "WholesalePool_upazila_idx" ON "WholesalePool" ("upazila");

-- CreateIndex
CREATE INDEX "WholesalePool_slug_idx" ON "WholesalePool" ("slug");

-- CreateIndex
CREATE INDEX "PoolParticipant_poolId_idx" ON "PoolParticipant" ("poolId");

-- CreateIndex
CREATE INDEX "PoolParticipant_participantId_idx" ON "PoolParticipant" ("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolParticipant_poolId_participantId_key" ON "PoolParticipant" ("poolId", "participantId");

-- AddForeignKey
ALTER TABLE "WholesalePool"
ADD CONSTRAINT "WholesalePool_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolParticipant"
ADD CONSTRAINT "PoolParticipant_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "WholesalePool" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolParticipant"
ADD CONSTRAINT "PoolParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;