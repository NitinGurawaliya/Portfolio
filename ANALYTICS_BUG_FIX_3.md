# Analytics Bug Fix #3: Lost PortfolioRepositoryId in Repository Merge

## Problem
When repositories are merged in the dashboard, the `portfolioRepositoryId` field (critical for analytics) is being lost when duplicate repositories exist.

## Root Cause
In `src/app/dashboard/page.tsx`, repositories from `portfolio.importedProjects` and `user.repositories` are merged. When a repository with the same GitHub ID exists in both arrays, the merge logic was:
1. Taking the first occurrence
2. NOT checking if either version has `portfolioRepositoryId`
3. Result: The version with `portfolioRepositoryId` could be overwritten by one without it

This happened because:
- `portfolio.importedProjects` (from database) has `portfolioRepositoryId` set
- `user.repositories` (from GitHub API) does NOT have `portfolioRepositoryId`
- The order matters: if GitHub repos come first, they overwrite database repos

## The Bug Code (Before)
```typescript
const mergedRepositories = allRepositories.reduce((acc, repo) => {
  const existingIndex = acc.findIndex(r => r.id === repo.id)
  if (existingIndex === -1) {
    acc.push(repo)
  }
  // If repository already exists, keep the first one (database version has priority)
  return acc
}, [] as any[])
```

## The Fix (After)
```typescript
const mergedRepositories = allRepositories.reduce((acc, repo) => {
  const existingIndex = acc.findIndex(r => r.id === repo.id)
  if (existingIndex === -1) {
    acc.push(repo)
  } else {
    // If repository already exists, prioritize the one with portfolioRepositoryId
    // This ensures analytics IDs are preserved
    if (repo.portfolioRepositoryId && !acc[existingIndex].portfolioRepositoryId) {
      acc[existingIndex] = repo
    }
  }
  return acc
}, [] as any[])
```

## Impact
- **Before**: Analytics showing 0 views because `portfolioRepositoryId` was missing
- **After**: Analytics work correctly because `portfolioRepositoryId` is preserved

## Files Changed
- `src/app/dashboard/page.tsx` - Fixed repository merge logic

## Testing
1. Load dashboard with existing projects
2. Verify "Times visited" shows correct numbers
3. Check project charts display data
4. Ensure no console warnings about missing `portfolioRepositoryId`

## Related Issues
This bug was causing the same symptoms as Issues #1 and #2:
- Analytics not showing views/graphs
- Dashboard showing 0 for all project statistics

However, this was a **different root cause** - not about ID mismatches in APIs, but about losing the ID during data merging in the frontend.
