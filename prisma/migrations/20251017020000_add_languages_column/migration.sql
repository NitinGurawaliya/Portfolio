-- AddLanguagesColumn
ALTER TABLE "Repository" ADD COLUMN IF NOT EXISTS "languages" TEXT;
