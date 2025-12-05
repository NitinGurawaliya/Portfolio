-- Migration SQL script to add productHuntUsername field to Portfolio table
-- Run this in Neon.tech SQL Editor for production database

-- Step 1: Check current Portfolio table structure (optional - for verification)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Portfolio'
ORDER BY ordinal_position;

-- Step 2: Add productHuntUsername column to Portfolio table
ALTER TABLE "Portfolio"
ADD COLUMN "productHuntUsername" TEXT;

-- Step 3: Verify the migration (should show the new column)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Portfolio' AND column_name = 'productHuntUsername';

-- Step 4: Check if any existing portfolios need migration (optional)
SELECT 
    COUNT(*) as total_portfolios,
    COUNT("productHuntUsername") as portfolios_with_producthunt
FROM "Portfolio";

