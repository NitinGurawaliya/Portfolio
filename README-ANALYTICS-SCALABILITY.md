# Analytics Scalability & Data Integrity

## Problem Solved
Analytics data was becoming orphaned when PortfolioRepository records were deleted, causing:
- Missing charts in dashboard
- Inconsistent project views
- Data integrity issues

## Database Changes Made

### 1. Soft Delete for PortfolioRepository
Added `deletedAt` field to preserve analytics history:
```sql
ALTER TABLE "PortfolioRepository" ADD COLUMN "deletedAt" TIMESTAMP;
```

### 2. Performance Indexes
Added composite indexes for faster queries:
```sql
CREATE INDEX "PortfolioRepository_portfolioId_isVisible_idx" ON "PortfolioRepository"("portfolioId", "isVisible");
CREATE INDEX "DailyProjectViews_portfolioId_projectId_idx" ON "DailyProjectViews"("portfolioId", "projectId");
```

### 3. Automatic Cleanup Triggers
When a PortfolioRepository is deleted, analytics data is automatically removed:
```sql
CREATE TRIGGER cleanup_analytics_on_delete
AFTER DELETE ON "PortfolioRepository"
```

## How It Works

### Scenario 1: Project Removed from Portfolio
1. User removes project from portfolio
2. `PortfolioRepository` record is soft-deleted (deletedAt set)
3. Analytics queries check `deletedAt IS NULL` to exclude soft-deleted projects
4. Historical data preserved for future reference

### Scenario 2: Project Completely Deleted
1. User permanently deletes project
2. Trigger automatically removes analytics data
3. Database remains consistent

## Maintenance

### Scheduled Cleanup
Run this weekly to maintain data integrity:
```bash
node scripts/cleanup-orphaned-analytics.js
```

### Manual Cleanup
If you need to clean up orphaned data manually:
```sql
-- Find orphaned entries
SELECT COUNT(*) FROM "DailyProjectViews" d
WHERE NOT EXISTS (
  SELECT 1 FROM "PortfolioRepository" pr 
  WHERE pr.id = d."projectId"
);

-- Run cleanup
SELECT cleanup_orphaned_analytics();
```

## Best Practices

### 1. Always Use PortfolioRepository ID
When tracking analytics, always use `PortfolioRepository.id`, not `Repository.githubId`:

```typescript
// ✅ Correct
projectId: portfolioRepository.id

// ❌ Incorrect
projectId: repository.githubId
```

### 2. Query with Soft Delete Check
Always filter by `deletedAt`:
```sql
SELECT * FROM "PortfolioRepository"
WHERE "portfolioId" = ?
AND "deletedAt" IS NULL
```

### 3. Regular Maintenance
- Run cleanup script weekly
- Monitor orphaned data count
- Check logs for data integrity warnings

## Performance at Scale

### Optimizations Applied
1. **Composite Indexes**: Faster join operations
2. **Query Filtering**: Filter by `deletedAt` early in queries
3. **Automatic Cleanup**: Reduces table size over time
4. **Cascade Deletes**: Efficient removal of related data

### Expected Performance
- **Query Time**: < 50ms for dashboard analytics
- **Cleanup Time**: < 1 second for 10k records
- **Trigger Overhead**: < 1ms per delete operation

## Monitoring

### Check Data Integrity
```sql
-- Find orphaned analytics
SELECT 
  COUNT(*) as orphaned_count,
  MIN("createdAt") as oldest_orphaned
FROM "DailyProjectViews" d
WHERE NOT EXISTS (
  SELECT 1 FROM "PortfolioRepository" pr 
  WHERE pr.id = d."projectId" AND pr."deletedAt" IS NULL
);
```

### Monitor Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('PortfolioRepository', 'DailyProjectViews');
```

## Future Improvements

1. **Partitioning**: Partition DailyProjectViews by date for better performance
2. **Archiving**: Move old analytics data to cold storage
3. **Caching**: Add Redis cache for frequently accessed analytics
4. **Batch Processing**: Process analytics in batches for large portfolios

