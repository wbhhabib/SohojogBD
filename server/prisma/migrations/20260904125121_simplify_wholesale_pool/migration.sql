/*
  Warnings:

  - The values [TARGET_REACHED] on the enum `PoolStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `quantity` on the `PoolParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `WholesalePool` table. All the data in the column will be lost.
  - You are about to drop the column `marketPricePerUnit` on the `WholesalePool` table. All the data in the column will be lost.
  - You are about to drop the column `minJoinQuantity` on the `WholesalePool` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `WholesalePool` table. All the data in the column will be lost.
  - You are about to drop the column `targetQuantity` on the `WholesalePool` table. All the data in the column will be lost.
  - Made the column `groupLink` on table `WholesalePool` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PoolStatus_new" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
ALTER TABLE "WholesalePool" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "WholesalePool" ALTER COLUMN "status" TYPE "PoolStatus_new" USING ("status"::text::"PoolStatus_new");
ALTER TYPE "PoolStatus" RENAME TO "PoolStatus_old";
ALTER TYPE "PoolStatus_new" RENAME TO "PoolStatus";
DROP TYPE "PoolStatus_old";
ALTER TABLE "WholesalePool" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "PoolParticipant" DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "WholesalePool" DROP COLUMN "deadline",
DROP COLUMN "marketPricePerUnit",
DROP COLUMN "minJoinQuantity",
DROP COLUMN "pricePerUnit",
DROP COLUMN "targetQuantity",
ADD COLUMN     "facebookLink" TEXT,
ALTER COLUMN "groupLink" SET NOT NULL;
