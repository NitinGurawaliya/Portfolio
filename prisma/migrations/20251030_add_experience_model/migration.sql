-- Create Experience table safely for production
CREATE TABLE IF NOT EXISTS "Experience" (
  "id" SERIAL PRIMARY KEY,
  "portfolioId" INTEGER NOT NULL,
  "companyName" VARCHAR(255) NOT NULL,
  "companyUrl" TEXT,
  "faviconUrl" TEXT,
  "role" VARCHAR(120),
  "duration" VARCHAR(120),
  "description" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FK to Portfolio
DO $$ BEGIN
  ALTER TABLE "Experience"
    ADD CONSTRAINT "Experience_portfolioId_fkey"
    FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Index for portfolioId
CREATE INDEX IF NOT EXISTS "Experience_portfolioId_idx" ON "Experience"("portfolioId");

-- Trigger to keep updatedAt fresh
CREATE OR REPLACE FUNCTION set_experience_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER experience_set_updated_at
  BEFORE UPDATE ON "Experience"
  FOR EACH ROW EXECUTE FUNCTION set_experience_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


