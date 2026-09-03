-- ─────────────────────────────────────────────────────────────────────────
-- ⚠️ BREAKING: this drops "startDate" (replaced by "applicationDeadline").
-- Run `SELECT count(*) FROM "Course";` before applying this migration.
-- If it's not 0, do NOT run this as-is — a data migration is needed instead
-- (e.g. rename instead of drop+add, or backfill applicationDeadline from
-- startDate first).
-- ─────────────────────────────────────────────────────────────────────────

-- AlterTable
ALTER TABLE "Course"
  DROP COLUMN "startDate",
  ADD COLUMN "venue" TEXT,
  ADD COLUMN "applicationDeadline" TIMESTAMP(3),
  ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "contactPhone" DROP NOT NULL;