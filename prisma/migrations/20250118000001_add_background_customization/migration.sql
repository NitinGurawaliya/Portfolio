-- Add background customization fields to Portfolio table
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "backgroundColor" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "backgroundPattern" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "Portfolio"."backgroundColor" IS 'Custom background color for portfolio (hex or color name)';
COMMENT ON COLUMN "Portfolio"."backgroundPattern" IS 'Custom background pattern (dots, grid, cross, waves, stars, none)';

