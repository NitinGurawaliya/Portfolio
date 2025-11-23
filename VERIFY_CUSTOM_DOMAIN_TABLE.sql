-- Verification Queries for CustomDomain Table
-- Run these in Neon.tech SQL Editor to verify everything is set up correctly

-- 1. Check if table exists and see structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'CustomDomain'
ORDER BY ordinal_position;

-- 2. Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'CustomDomain'
ORDER BY indexname;

-- 3. Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'CustomDomain';

-- 4. Check if migration is marked as applied
SELECT 
    migration_name,
    finished_at,
    started_at,
    logs
FROM "_prisma_migrations"
WHERE migration_name = '20251117000001_add_custom_domain_mapping';

-- 5. Test insert (optional - to verify table works)
-- Uncomment to test:
-- INSERT INTO "CustomDomain" (
--     "id", "domain", "portfolioId", "userId", "verificationToken"
-- ) VALUES (
--     'test-id-123',
--     'test.example.com',
--     1,
--     1,
--     'test-token'
-- ) ON CONFLICT DO NOTHING;
-- 
-- SELECT * FROM "CustomDomain" WHERE "id" = 'test-id-123';
-- 
-- DELETE FROM "CustomDomain" WHERE "id" = 'test-id-123';

