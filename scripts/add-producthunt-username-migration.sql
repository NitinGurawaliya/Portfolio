-- Migration: Add productHuntUsername column to Portfolio table
-- Run this in your Neon.tech SQL editor

-- Add the productHuntUsername column
ALTER TABLE "Portfolio" 
ADD COLUMN IF NOT EXISTS "productHuntUsername" TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN "Portfolio"."productHuntUsername" IS 'ProductHunt username for showcasing projects';

