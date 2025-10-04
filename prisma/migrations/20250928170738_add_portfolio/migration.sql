-- AlterTable
ALTER TABLE "public"."Portfolio" ADD COLUMN     "selectedTheme" TEXT NOT NULL DEFAULT 'modern-dark',
ADD COLUMN     "themeConfig" JSONB;
