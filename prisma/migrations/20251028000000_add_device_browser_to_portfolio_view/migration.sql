-- Add device and browser fields to PortfolioView table for enhanced analytics
ALTER TABLE "PortfolioView" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "PortfolioView" ADD COLUMN IF NOT EXISTS "browser" TEXT;

-- Create indexes for device and browser to improve query performance
CREATE INDEX IF NOT EXISTS "PortfolioView_device_idx" ON "PortfolioView"("device");
CREATE INDEX IF NOT EXISTS "PortfolioView_browser_idx" ON "PortfolioView"("browser");

-- Add comments explaining the purpose of these fields
COMMENT ON COLUMN "PortfolioView"."device" IS 'Detected device type (e.g., Windows, Mac, iPhone, Android Mobile)';
COMMENT ON COLUMN "PortfolioView"."browser" IS 'Detected browser type (e.g., Chrome, Firefox, Brave, Safari, Edge)';

