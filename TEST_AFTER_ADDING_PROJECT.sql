-- ============================================
-- RUN THIS AFTER ADDING A NEW PROJECT AND PUBLISHING
-- This will show you if analytics are still working correctly
-- ============================================

-- 1. CHECK STATUS AFTER ADDING PROJECT
SELECT 
    CASE 
        WHEN orphaned_clicks > 0 THEN '⚠️ CORRUPTION DETECTED'
        WHEN total_active_projects < 8 THEN '❌ PROJECTS DELETED'
        WHEN orphaned_clicks = 0 AND total_active_projects >= 8 THEN '✅ ALL GOOD'
        ELSE '✅ NO CORRUPTION FOUND'
    END as final_status,
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


-- 2. SHOW ALL PROJECTS WITH THEIR ANALYTICS (VERIFY NOTHING RESET)
SELECT 
    pr.id as portfolio_repo_id,
    COALESCE(pr."customName", r.name) as project_name,
    COUNT(DISTINCT pc.id) as click_count,
    SUM(COALESCE(dpv.views, 0)) as total_views,
    CASE 
        WHEN COUNT(DISTINCT pc.id) = 0 AND SUM(COALESCE(dpv.views, 0)) = 0 THEN '❌ NO ANALYTICS'
        ELSE '✅ HAS DATA'
    END as analytics_status
FROM "PortfolioRepository" pr
LEFT JOIN "Repository" r ON r.id = pr."repositoryId"
LEFT JOIN "ProjectClick" pc ON pc."projectId" = CAST(pr.id AS BIGINT)
LEFT JOIN "DailyProjectViews" dpv ON dpv."projectId" = CAST(pr.id AS BIGINT)
WHERE pr."portfolioId" = 1 AND pr."deletedAt" IS NULL
GROUP BY pr.id, pr."customName", r.name
ORDER BY pr."createdAt" DESC;


-- 3. CHECK IF ANY ANALYTICS WERE LOST
SELECT 
    'Old Analytics Lost?' as check_type,
    COUNT(*) as affected_projects
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pc."portfolioId" = 1 AND pr.id IS NULL
UNION ALL
SELECT 
    'Daily Views Lost?',
    COUNT(*)
FROM "DailyProjectViews" dpv
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(dpv."projectId" AS INTEGER)
WHERE dpv."portfolioId" = 1 AND (pr.id IS NULL OR pr."deletedAt" IS NOT NULL);


-- 4. COUNT PROJECTS (SHOULD BE 9 AFTER ADDING ONE)
SELECT 
    'Expected Projects' as info,
    9 as expected_count,
    COUNT(*) as actual_count,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ CORRECT'
        WHEN COUNT(*) = 8 THEN '⚠️ NEW PROJECT NOT ADDED'
        ELSE '❌ WRONG COUNT'
    END as status
FROM "PortfolioRepository"
WHERE "portfolioId" = 1 AND "deletedAt" IS NULL;


-- 5. QUICK HEALTH CHECK SUMMARY
SELECT 
    CASE 
        WHEN orphaned_clicks > 0 THEN '❌ FAILED - Data corruption detected'
        WHEN total_active_projects != 9 THEN '⚠️ WARNING - Project count mismatch'
        ELSE '✅ PASSED - All checks OK'
    END as test_result,
    'Before: 8 projects, 8 clicks | After: ' || total_active_projects::text || ' projects, ' || total_project_clicks::text || ' clicks' as summary
FROM (
    SELECT 
        (SELECT COUNT(*) FROM "PortfolioRepository" WHERE "portfolioId" = 1 AND "deletedAt" IS NULL) as total_active_projects,
        (SELECT COUNT(*) FROM "ProjectClick" WHERE "portfolioId" = 1) as total_project_clicks,
        (SELECT COUNT(*) FROM "ProjectClick" pc
         LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
         WHERE pr.id IS NULL AND pc."portfolioId" = 1) as orphaned_clicks
) as stats;
