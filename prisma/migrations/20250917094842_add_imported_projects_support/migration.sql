-- AlterTable
ALTER TABLE "public"."Repository" ADD COLUMN     "author" TEXT,
ADD COLUMN     "favicon" TEXT,
ADD COLUMN     "isImported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "siteName" TEXT;
