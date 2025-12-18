-- Add Product Hunt integration persistence:
-- 1) productHuntUsername on Portfolio
-- 2) OAuthToken table (per user + platform)

-- Portfolio: store connected Product Hunt username
ALTER TABLE "public"."Portfolio"
  ADD COLUMN IF NOT EXISTS "productHuntUsername" TEXT;

COMMENT ON COLUMN "public"."Portfolio"."productHuntUsername"
  IS 'ProductHunt username for showcasing projects';

-- OAuthToken: store platform OAuth tokens (Product Hunt)
-- Create table if missing (older DBs won't have it)
CREATE TABLE IF NOT EXISTS "public"."OAuthToken" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "platform" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OAuthToken_pkey" PRIMARY KEY ("id")
);

-- Ensure FK exists (if table was created earlier without it)
DO $$
BEGIN
  ALTER TABLE "public"."OAuthToken"
    ADD CONSTRAINT "OAuthToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- If an older schema created a unique index on userId only, drop it
DO $$
BEGIN
  DROP INDEX IF EXISTS "public"."OAuthToken_userId_key";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enforce per-user-per-platform uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "OAuthToken_userId_platform_key"
  ON "public"."OAuthToken"("userId", "platform");

-- Helpful lookup index (also matches Prisma @@index)
CREATE INDEX IF NOT EXISTS "OAuthToken_userId_platform_idx"
  ON "public"."OAuthToken"("userId", "platform");

