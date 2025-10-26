# Analytics Reset Fix Summary

## Problem
When adding a new project and publishing, analytics data for old projects was resetting to 0. This happened because PortfolioRepository IDs were being recreated, breaking the link to existing analytics data.

## Root Cause
In the publish process (`src/app/api/portfolio/publish-all/route.ts`):
1. All PortfolioRepository records were being **deleted** and recreated
2. This created **new IDs** for existing projects
3. Analytics data was still linked to the **old IDs**
4. Result: Analytics couldn't find matching records and showed 0

## Solution
Changed the publish logic to **update existing records** instead of deleting and recreating them:

### Before:
```typescript
// Delete all existing records
await tx.portfolioRepository.deleteMany({
  where: { portfolioId: portfolio.id }
})

// Create new records (with new IDs)
await tx.portfolioRepository.createMany({
  data: portfolioRepos
})
```

### After:
```typescript
// Get existing records
const existingPortfolioRepos = await tx.portfolioRepository.findMany({
  where: { portfolioId: portfolio.id }
})

// For each repo, update existing OR create new
for (const repoData of portfolioRepos) {
  const existing = existingRepoMap.get(repoData.repositoryId)
  
  if (existing) {
    // UPDATE existing to preserve ID
    await tx.portfolioRepository.update({
      where: { id: existing.id },
      data: {
        deployedUrl: repoData.deployedUrl,
        customName: repoData.customName,
        customDescription: repoData.customDescription,
        displayOrder: repoData.displayOrder,
        isVisible: repoData.isVisible
      }
    })
  } else {
    // CREATE new for new repos
    await tx.portfolioRepository.create({
      data: repoData
    })
  }
}
```

## Key Changes
1. **ID Preservation**: Existing PortfolioRepository records keep their IDs
2. **Update Instead of Delete**: Update existing records rather than deleting them
3. **Analytics Integrity**: Analytics data remains linked to correct PortfolioRepository IDs
4. **Incremental Updates**: Only creates new records for truly new projects

## Benefits
- ✅ Analytics data persists when adding new projects
- ✅ Historical click data is preserved
- ✅ Dashboard charts continue to work
- ✅ "Times visited" counter shows correct data
- ✅ No loss of analytics data

## Files Changed
- `src/app/api/portfolio/publish-all/route.ts` - Modified portfolio repository handling

## Testing
1. **Add a new project** to your portfolio
2. **Publish** the portfolio
3. **Check analytics** - Old project analytics should still be there
4. **Click projects** on public portfolio
5. **Verify** that both old and new project analytics update correctly

## Status
✅ **Code changes complete**
🔄 **Needs testing after deployment**
