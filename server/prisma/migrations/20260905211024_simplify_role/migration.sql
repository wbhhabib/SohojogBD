/*
Warnings:

- The values [DONOR,CREATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"::text
    WHEN 'DONOR' THEN 'USER'
    WHEN 'CREATOR' THEN 'USER'
    ELSE "role"::text
  END
)::"Role_new";

ALTER TYPE "Role" RENAME TO "Role_old";

ALTER TYPE "Role_new" RENAME TO "Role";

DROP TYPE "Role_old";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

COMMIT;