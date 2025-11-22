-- Add Vercel IP fields to CustomDomain table
ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "vercelIPAddress" TEXT,
ADD COLUMN IF NOT EXISTS "vercelCnameTarget" TEXT;

