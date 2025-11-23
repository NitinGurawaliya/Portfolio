-- Custom Domain Table Migration
-- Run this SQL in Neon.tech SQL Editor

-- Step 1: Create CustomDomain table
CREATE TABLE IF NOT EXISTS "CustomDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "verificationToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "CustomDomain_domain_key" ON "CustomDomain"("domain");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomDomain_portfolioId_key" ON "CustomDomain"("portfolioId");

-- Step 3: Create regular indexes
CREATE INDEX IF NOT EXISTS "CustomDomain_userId_idx" ON "CustomDomain"("userId");
CREATE INDEX IF NOT EXISTS "CustomDomain_domain_idx" ON "CustomDomain"("domain");
CREATE INDEX IF NOT EXISTS "CustomDomain_verified_idx" ON "CustomDomain"("verified");

-- Step 4: Add foreign key constraints (only if Portfolio and User tables exist)
DO $$ 
BEGIN
    -- Add foreign key to Portfolio
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Portfolio') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'CustomDomain_portfolioId_fkey'
        ) THEN
            ALTER TABLE "CustomDomain" 
            ADD CONSTRAINT "CustomDomain_portfolioId_fkey" 
            FOREIGN KEY ("portfolioId") 
            REFERENCES "Portfolio"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;

    -- Add foreign key to User
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'CustomDomain_userId_fkey'
        ) THEN
            ALTER TABLE "CustomDomain" 
            ADD CONSTRAINT "CustomDomain_userId_fkey" 
            FOREIGN KEY ("userId") 
            REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Step 5: Mark migration as applied in Prisma migrations table
-- (This tells Prisma the migration is done)
INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "finished_at",
    "migration_name",
    "logs",
    "rolled_back_at",
    "started_at",
    "applied_steps_count"
)
SELECT 
    gen_random_uuid()::text,
    '',
    NOW(),
    '20251117000001_add_custom_domain_mapping',
    'Migration applied manually via SQL',
    NULL,
    NOW(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" 
    WHERE migration_name = '20251117000001_add_custom_domain_mapping'
);

-- Verification: Check if table was created successfully
SELECT 
    'CustomDomain table created successfully!' as status,
    COUNT(*) as total_domains
FROM "CustomDomain";

