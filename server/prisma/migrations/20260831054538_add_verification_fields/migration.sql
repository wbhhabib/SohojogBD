-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('NID', 'BIRTH_CERTIFICATE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "district" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "hasTraining" BOOLEAN DEFAULT false,
ADD COLUMN     "identityDocPicture" TEXT,
ADD COLUMN     "identityNumber" TEXT,
ADD COLUMN     "identityType" "IdentityType",
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "isStudent" BOOLEAN DEFAULT false,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "skill" TEXT,
ADD COLUMN     "studentIdCard" TEXT,
ADD COLUMN     "trainingCertificate" TEXT,
ADD COLUMN     "upazila" TEXT,
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED';
