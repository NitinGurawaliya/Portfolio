-- ============================================
-- ANALYTICS DATABASE HEALTH CHECK
-- Run these queries in Neon SQL Editor to check for data corruption
-- ============================================

-- 1. CHECK ORPHANED PROJECT CLICKS
-- Click records that don't have a valid PortfolioRepository
-- This indicates data corruption or deleted projects
SELECT 
    pc.id as click_id,
    pc."projectId" as click_project_id,
    pc."projectName",
    pr.id as portfolio_repo_id,
    pr."repositoryId" as database_repo_id,
    pc."clickedAt"
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL
ORDER BY pc."clickedAt" DESC;

-- Count orphaned records
SELECT COUNT(*) as orphaned_clicks_count
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL;


-- 2. CHECK ORPHANED DAILY PROJECT VIEWS
-- Daily views for projects that no longer exist
SELECT 
    dpv."projectId",
    dpv."projectName",
    dpv."portfolioId",
    dpv.date,
    dpv.views,
    pr.id as portfolio_repo_exists,
    pr."deletedAt" as is_deleted
FROM "DailyProjectViews" dpv
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(dpv."projectId" AS INTEGER)
WHERE pr.id IS NULL OR pr."deletedAt" IS NOT NULL
ORDER BY dpv.date DESC;

-- Count orphaned daily views
SELECT COUNT(*) as orphaned_daily_views_count
FROM "DailyProjectViews" dpv
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(dpv."projectId" AS INTEGER)
WHERE pr.id IS NULL OR pr."deletedAt" IS NOT NULL;


-- 3. CHECK PORTFOLIO REPOSITORIES WITHOUT DELETED DATE
-- Active portfolio repos
SELECT 
    pr.id,
    pr."portfolioId",
    pr."repositoryId",
    pr."customName",
    pr."isVisible",
    pr."deletedAt",
    r.name as repository_name,
    r."githubId"
FROM "PortfolioRepository" pr
JOIN "Repository" r ON r.id = pr."repositoryId"
WHERE pr."deletedAt" IS NULL
ORDER BY pr.id;


-- 4. CHECK PORTFOLIO REPOSITORIES WITH ANALYTICS DATA
-- See which portfolio repos have click data
SELECT 
    pr.id as portfolio_repo_id,
    pr."customName",
    r.name as repository_name,
    COUNT(pc.id) as click_count,
    SUM(COALESCE(dpv.views, 0)) as total_views,
    pr."deletedAt" as is_deleted
FROM "PortfolioRepository" pr
LEFT JOIN "Repository" r ON r.id = pr."repositoryId"
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT)
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT)
GROUP BY pr.id, pr."customName", r.name, pr."deletedAt"
ORDER BY click_count DESC, total_views DESC;


-- 5. CHECK ANALYTICS FOR DELETED PORTFOLIO REPOSITORIES
-- Find analytics data for soft-deleted projects
SELECT 
    pr.id as portfolio_repo_id,
    pr."portfolioId",
    pr."customName",
    pr."deletedAt",
    COUNT(DISTINCT pc.id) as click_count,
    SUM(COALESCE(dpv.views, 0)) as total_daily_views
FROM "PortfolioRepository" pr
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT)
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT)
WHERE pr."deletedAt" IS NOT NULL
GROUP BY pr.id, pr."portfolioId", pr."customName", pr."deletedAt"
HAVING COUNT(DISTINCT pc.id) > 0 OR SUM(COALESCE(dpv.views, 0)) > 0
ORDER BY pr."deletedAt" DESC;


-- 6. CHECK FOR DUPLICATE ANALYTICS DATA
-- Find projects with multiple portfolio repo IDs (potential issue)
SELECT 
    r."githubId",
    r.name as repository_name,
    COUNT(DISTINCT pr.id) as portfolio_repo_count,
    STRING_AGG(CAST(pr.id AS TEXT), ', ') as portfolio_repo_ids
FROM "Repository" r
JOIN "PortfolioRepository" pr ON pr."repositoryId" = r.id
WHERE pr."deletedAt" IS NULL
GROUP BY r."githubId", r.name
HAVING COUNT(DISTINCT pr.id) > 1;


-- 7. CHECK ANALYTICS BY PORTFOLIO
-- Get analytics summary for each portfolio
SELECT 
    p.id as portfolio_id,
    p."displayName",
    COUNT(DISTINCT pr.id) as total_projects,
    COUNT(DISTINCT CASE WHEN pr."deletedAt" IS NULL THEN pr.id END) as active_projects,
    COUNT(DISTINCT CASE WHEN pr."deletedAt" IS NOT NULL THEN pr.id END) as deleted_projects,
    COUNT(DISTINCT pc.id) as total_clicks,
    SUM(COALESCE(dpv.views, 0)) as total_views
FROM "Portfolio" p
LEFT JOIN "PortfolioRepository" pr ON pr."portfolioId" = p.id
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT) AND pc."portfolioId" = p.id
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT) AND dpv."portfolioId" = p.id
GROUP BY p.id, p."displayName"
ORDER BY total_views DESC, total_clicks DESC;


-- 8. CHECK FOR BIGINT MISMATCH ISSUES
-- Verify projectId types match correctly
SELECT 
    'ProjectClick' as table_name,
    MIN("projectId") as min_project_id,
    MAX("projectId") as max_project_id,
    COUNT(*) as total_records
FROM "ProjectClick"
UNION ALL
SELECT 
    'DailyProjectViews' as table_name,
    MIN("projectId") as min_project_id,
    MAX("projectId") as max_project_id,
    COUNT(*) as total_records
FROM "DailyProjectViews"
UNION ALL
SELECT 
    'PortfolioRepository' as table_name,
    MIN(id) as min_project_id,
    MAX(id) as max_project_id,
    COUNT(*) as total_records
FROM "PortfolioRepository";


-- 9. FIND PROJECTS WITH INCONSISTENT ANALYTICS DATA
-- Projects where click count doesn't match daily views
SELECT 
    pr.id as portfolio_repo_id,
    pr."customName",
    COUNT(DISTINCT pc.id) as click_count,
    SUM(COALESCE(dpv.views, 0)) as daily_views_total,
    ABS(COUNT(DISTINCT pc.id) - SUM(COALESCE(dpv.views, 0))) as difference
FROM "PortfolioRepository" pr
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT)
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT)
WHERE pr."deletedAt" IS NULL
GROUP BY pr.id, pr."customName"
HAVING ABS(COUNT(DISTINCT pc.id) - SUM(COALESCE(dpv.views, 0))) > 10
ORDER BY difference DESC;


-- 10. SUMMARY OF DATA HEALTH
SELECT 
    'Total Portfolio Repositories' as metric,
    COUNT(*) as count,
    'Active' as status
FROM "PortfolioRepository"
WHERE "deletedAt" IS NULL
UNION ALL
SELECT 
    'Total Portfolio Repositories',
    COUNT(*),
    'Deleted'
FROM "PortfolioRepository"
WHERE "deletedAt" IS NOT NULL
UNION ALL
SELECT 
    'Total Project Clicks',
    COUNT(*),
    'All Time'
FROM "ProjectClick"
UNION ALL
SELECT 
    'Total Daily Project Views Records',
    COUNT(*),
    'All Time'
FROM "DailyProjectViews"
UNION ALL
SELECT 
    'Orphaned Project Clicks',
    COUNT(*),
    'Need Cleanup'
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL
UNION ALL
SELECT 
    'Orphaned Daily Views',
    COUNT(*),
    'Need Cleanup'
FROM "DailyProjectViews" dpv
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(dpv."projectId" AS INTEGER)
WHERE pr.id IS NULL OR pr."deletedAt" IS NOT NULL;


-- ============================================
-- CLEANUP COMMANDS (USE WITH CAUTION)
-- Only run these if you find orphaned data
-- ============================================

-- DANGER: Delete orphaned project clicks (only if you're sure)
-- DELETE FROM "ProjectClick" pc
-- WHERE NOT EXISTS (
--     SELECT 1 FROM "PortfolioRepository" pr 
--     WHERE pr.id = CAST(pc."projectId" AS INTEGER)
-- );

-- DANGER: Delete orphaned daily project views (only if you're sure)
-- DELETE FROM "DailyProjectViews" dpv
-- WHERE NOT EXISTS (
--     SELECT 1 FROM "PortfolioRepository" pr 
--     WHERE pr.id = CAST(dpv."projectId" AS INTEGER) 
--     AND pr."deletedAt" IS NULL
-- );
