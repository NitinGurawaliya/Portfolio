# How to Run Database Health Checks in Neon

## Steps to Run SQL Queries in Neon

### 1. Open Neon Dashboard
1. Go to https://console.neon.tech
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### 2. Run Health Checks
Open the file `ANALYTICS_DB_HEALTH_CHECK.sql` and copy each query one by one into the Neon SQL Editor.

### 3. Key Queries to Run First

Start with these **critical checks**:

#### Check #1: Orphaned Project Clicks
```sql
SELECT COUNT(*) as orphaned_clicks_count
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL;
```
**Expected:** Should be `0` - if not, you have orphaned data

#### Check #2: Orphaned Daily Views
```sql
SELECT COUNT(*) as orphaned_daily_views_count
FROM "DailyProjectViews" dpv
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(dpv."projectId" AS INTEGER)
WHERE pr.id IS NULL OR pr."deletedAt" IS NOT NULL;
```
**Expected:** Should be `0` for active projects

#### Check #10: Overall Summary
```sql
SELECT 
    'Total Portfolio Repositories' as metric,
    COUNT(*) as count,
    'Active' as status
FROM "PortfolioRepository"
WHERE "deletedAt" IS NULL
UNION ALL
SELECT 
    'Orphaned Project Clicks',
    COUNT(*),
    'Need Cleanup'
FROM "ProjectClick" pc
LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
WHERE pr.id IS NULL;
```

### 4. What to Look For

**Good Signs:**
- Orphaned counts = 0
- All portfolio repos have matching analytics
- No deleted projects with analytics

**Bad Signs:**
- Orphaned clicks > 0 (need cleanup)
- Orphaned daily views > 0 (need cleanup)
- Big discrepancies between click counts and views

### 5. If You Find Orphaned Data

**Option A: Keep the data (if it's historical)**
- Do nothing - analytics will still work for active projects
- Old deleted project analytics will just not show

**Option B: Clean up orphaned data**
Uncomment these lines in the SQL file (USE WITH CAUTION):
```sql
-- Delete orphaned project clicks
DELETE FROM "ProjectClick" pc
WHERE NOT EXISTS (
    SELECT 1 FROM "PortfolioRepository" pr 
    WHERE pr.id = CAST(pc."projectId" AS INTEGER)
);
```

### 6. Quick Status Check

Run this single query to see overall health:
```sql
SELECT 
    CASE 
        WHEN orphaned_clicks > 0 THEN '⚠️ HAS ORPHANED DATA'
        ELSE '✅ NO ISSUES FOUND'
    END as status,
    total_active_projects,
    total_project_clicks,
    orphaned_clicks
FROM (
    SELECT 
        (SELECT COUNT(*) FROM "PortfolioRepository" WHERE "deletedAt" IS NULL) as total_active_projects,
        (SELECT COUNT(*) FROM "ProjectClick") as total_project_clicks,
        (SELECT COUNT(*) FROM "ProjectClick" pc
         LEFT JOIN "PortfolioRepository" pr ON pr.id = CAST(pc."projectId" AS INTEGER)
         WHERE pr.id IS NULL) as orphaned_clicks
) as stats;
```

## Expected Results After Fixes

After applying the 3 bug fixes, you should see:
- ✅ No orphaned data
- ✅ All analytics linked correctly
- ✅ Portfolio repos have matching project IDs
- ✅ No data corruption

## Need Help?

If you find issues:
1. Check the specific query results
2. Look for patterns in orphaned data
3. Review the cleanup section in the SQL file
4. Only delete data if you're 100% sure it's safe
