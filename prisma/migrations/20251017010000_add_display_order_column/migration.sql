-- AddDisplayOrderColumn
ALTER TABLE "PortfolioRepository" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER;
