-- Add OAuthToken table for storing ProductHunt OAuth tokens
-- Run this migration in your database (Neon.tech SQL editor)
-- 
-- IMPORTANT: After running this, also run: npx prisma generate
-- This will update the Prisma client to include the new OAuthToken model

CREATE TABLE IF NOT EXISTS "OAuthToken" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER UNIQUE NOT NULL,
  "platform" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create composite index for faster lookups
CREATE INDEX IF NOT EXISTS "OAuthToken_userId_platform_idx" ON "OAuthToken"("userId", "platform");

-- Note: Prisma's @updatedAt will automatically update the "updatedAt" field on updates
-- No trigger needed - Prisma handles this in application code

