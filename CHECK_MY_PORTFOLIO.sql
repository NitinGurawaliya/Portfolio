-- ============================================
-- QUICK HEALTH CHECK FOR PORTFOLIO ID = 1
-- Copy and paste each query one by one in Neon SQL Editor
-- ============================================

-- 1. QUICK STATUS CHECK
SELECT 
    CASE 
        WHEN orphaned_clicks > 0 THEN '⚠️ HAS CORRUPTED DATA'
        ELSE '✅ NO CORRUPTION FOUND'
    END as status,
    total_active_projects,
    total_project_clicks,
    orphaned_clicks,
    total_daily_views
FROM (
    SELECT 
        (SELECT COUNT(*) FROM "PortfolioRepository" WHERE "portfolioId" = 1 AND "deletedAt" IS NULL) as total_active_projects,
        (SELECT COUNT(*) FROM "ProjectClick" WHERE "portfolioId" = 1) as total_project_clicks,
        (SELECT COUNT(*) FROM "ProjectClick" pc
         LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
         WHERE pr.id IS NULL AND pc."portfolioId" = 1) as orphaned_clicks,
        (SELECT COUNT(*) FROM "DailyProjectViews" WHERE "portfolioId" = 1) as total_daily_views
) as stats;


-- 2. CHECK ORPHANED PROJECT CLICKS (CORRUPTED DATA)
SELECT 
    'Orphaned Clicks' as issue_type,
    pc.id as click_id,
    pc."projectId" as corrupted_project_id,
    pc."projectName",
    pc."clickedAt"
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL 
  AND pc."portfolioId" = 1
ORDER BY pc."clickedAt" DESC;


-- 3. COUNT ORPHANED DATA FOR PORTFOLIO 1
SELECT 
    'Orphaned Project Clicks' as data_type,
    COUNT(*) as count
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL AND pc."portfolioId" = 1
UNION ALL
SELECT 
    'Orphaned Daily Views',
    COUNT(*)
FROM "DailyProjectViews" dpv
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(dpv."projectId" AS INTEGER)
WHERE (pr.id IS NULL OR pr."deletedAt" IS NOT NULL) AND dpv."portfolioId" = 1;


-- 4. YOUR PROJECTS WITH ANALYTICS (SHOULD WORK)
SELECT 
    pr.id as portfolio_repo_id,
    pr."customName" as project_name,
    COALESCE(pr."customName", r.name) as display_name,
    COUNT(DISTINCT pc.id) as total_clicks,
    SUM(COALESCE(dpv.views, 0)) as total_views,
    pr."deletedAt" as is_deleted
FROM "PortfolioRepository" pr
LEFT JOIN "Repository" r ON r.id = pr."repositoryId"
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT) AND pc."portfolioId" = 1
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT) AND dpv."portfolioId" = 1
WHERE pr."portfolioId" = 1
GROUP BY pr.id, pr."customName", r.name, pr."deletedAt"
ORDER BY total_clicks DESC, total_views DESC;


-- 5. PROJECTS THAT HAVE ANALYTICS BUT NO MATCH (CORRUPTED)
SELECT 
    'Corrupted Data' as issue,
    pc."projectId" as corrupted_id,
    pc."projectName",
    MAX(pc."clickedAt") as last_click
FROM "ProjectClick" pc
WHERE pc."portfolioId" = 1
  AND NOT EXISTS (
      SELECT 1 FROM "PortfolioRepository" pr 
      WHERE pr.id = CAST(pc."projectId" AS INTEGER) 
        AND pr."portfolioId" = 1
  )
GROUP BY pc."projectId", pc."projectName"
ORDER BY last_click DESC;


-- 6. SUMMARY OF YOUR PORTFOLIO
SELECT 
    p."displayName",
    COUNT(DISTINCT pr.id) as total_projects,
    COUNT(DISTINCT CASE WHEN pr."deletedAt" IS NULL THEN pr.id END) as active_projects,
    COUNT(DISTINCT pc.id) as total_clicks,
    SUM(COALESCE(dpv.views, 0)) as total_views,
    COUNT(DISTINCT CASE WHEN pr."deletedAt" IS NOT NULL THEN pr.id END) as deleted_projects
FROM "Portfolio" p
LEFT JOIN "PortfolioRepository" pr ON pr."portfolioId" = p.id
LEFT JOIN "ProjectClick" pc ON pc."portfolioId" = p.id
LEFT JOIN "DailyProjectViews" dpv ON dpv."portfolioId" = p.id
WHERE p.id = 1
GROUP BY p.id, p."displayName";


-- 7. CHECK IF YOUR PROJECT IDS MATCH (VERY IMPORTANT)
SELECT 
    pr.id as portfolio_repo_id,
    pr."customName",
    COUNT(DISTINCT pc.id) as clicks_linked,
    COUNT(DISTINCT dpv.id) as views_linked,
    CASE 
        WHEN COUNT(DISTINCT pc.id) = 0 AND COUNT(DISTINCT dpv.id) = 0 THEN '❌ NO ANALYTICS'
        ELSE '✅ HAS ANALYTICS'
    END as status
FROM "PortfolioRepository" pr
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT)
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT)
WHERE pr."portfolioId" = 1 AND pr."deletedAt" IS NULL
GROUP BY pr.id, pr."customName"
ORDER BY pr.id;


-- 8. FIND MISMATCHED IDS (ANALYTICS POINTING TO WRONG PROJECTS)
SELECT 
    'ID Mismatch' as issue,
    pc."projectId" as analytics_id,
    pr.id as actual_portfolio_id,
    pr."customName"
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pc."portfolioId" = 1
  AND (
    pr.id IS NULL 
    OR pr."portfolioId" != 1
  )
LIMIT 10;


-- 9. CLEAN SUMMARY FOR PORTFOLIO 1
SELECT 
    'Active Projects' as metric,
    COUNT(*) as value
FROM "PortfolioRepository"
WHERE "portfolioId" = 1 AND "deletedAt" IS NULL
UNION ALL
SELECT 
    'Project Clicks',
    COUNT(*)
FROM "ProjectClick"
WHERE "portfolioId" = 1
UNION ALL
SELECT 
    'Daily View Records',
    COUNT(*)
FROM "DailyProjectViews"
WHERE "portfolioId" = 1
UNION ALL
SELECT 
    'Corrupted Clicks',
    COUNT(*)
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pc."portfolioId" = 1 AND pr.id IS NULL;


-- 10. VERIFY YOUR PROJECT NAMES WITH ANALYTICS
SELECT 
    pr.id,
    COALESCE(pr."customName", r.name) as project_name,
    r.name as github_name,
    pr."repositoryId",
    (SELECT COUNT(*) FROM "ProjectClick" WHERE "projectId" = CAST(pr.id AS BIGINT)) as click_count,
    (SELECT SUM(views) FROM "DailyProjectViews" WHERE "projectId" = CAST(pr.id AS BIGINT)) as total_views
FROM "PortfolioRepository" pr
LEFT JOIN "Repository" r ON r.id = pr."repositoryId"
WHERE pr."portfolioId" = 1
ORDER BY pr.id;
