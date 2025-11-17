-- Add project insight metadata fields to PortfolioRepository
ALTER TABLE "PortfolioRepository"
ADD COLUMN IF NOT EXISTS "projectCategory" TEXT,
ADD COLUMN IF NOT EXISTS "projectStatus" TEXT DEFAULT 'building',
ADD COLUMN IF NOT EXISTS "projectRevenue" INTEGER,
ADD COLUMN IF NOT EXISTS "projectMrr" INTEGER,
ADD COLUMN IF NOT EXISTS "projectUsers" INTEGER;
