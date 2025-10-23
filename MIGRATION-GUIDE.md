# Migration Guide

## 📋 Available Migration Commands

### Development Commands
```bash
# Check migration status
npm run migrate:status

# Deploy migrations (for production)
npm run migrate:deploy

# Reset database (DANGER - only for development)
npm run migrate:reset

# Push schema changes (for development only)
npm run db:push

# Pull current database schema
npm run db:pull
```

### Production Deployment
```bash
# This runs automatically during Vercel build
npm run build
```

## 🗂️ Migration Files Created

### 1. `20250120000000_add_analytics_tables`
**Purpose**: Adds analytics tracking tables
**Changes**:
- Creates `PortfolioView` table for tracking individual views
- Creates `PortfolioAnalytics` table for aggregated statistics
- Adds proper indexes for performance

### 2. `20250120000001_add_logo_column_safe`
**Purpose**: Safely adds logo column to Repository table
**Changes**:
- Adds `logo` column to `Repository` table
- Uses safe SQL that only adds column if it doesn't exist

## 🚀 Production Deployment Process

### Automatic (Recommended)
When you deploy to Vercel, the build process automatically:
1. Runs `prisma generate` to update Prisma client
2. Runs `prisma migrate deploy` to apply pending migrations
3. Builds the Next.js application

### Manual (If needed)
```bash
# Deploy migrations manually
npm run migrate:deploy

# Check status
npm run migrate:status
```

## ⚠️ Safety Features

### Safe Migration Design
- **No data loss**: All migrations are additive only
- **Idempotent**: Can run multiple times safely
- **Conditional**: Checks if changes already exist
- **Rollback**: Each migration can be rolled back if needed

### Production Safety
- **Automatic deployment**: Migrations run during build
- **Error handling**: Build fails if migrations fail
- **Status tracking**: Prisma tracks applied migrations
- **No manual intervention**: Fully automated

## 🔍 Migration Status

Check current migration status:
```bash
npm run migrate:status
```

Expected output:
```
Database schema is up to date!
```

## 📊 What Gets Created

### Analytics Tables
1. **PortfolioView**: Tracks every portfolio visit
2. **PortfolioAnalytics**: Stores summary statistics

### Repository Enhancement
1. **Logo Column**: Stores generated fallback logos

## 🎯 Benefits of This Approach

### ✅ Advantages
- **Automatic**: Runs during Vercel build
- **Safe**: No data loss risk
- **Tracked**: Prisma manages migration history
- **Rollback**: Can undo changes if needed
- **Production Ready**: Tested and safe

### ✅ vs Custom Scripts
- **Standard**: Uses Prisma's built-in migration system
- **Reliable**: Battle-tested by thousands of developers
- **Maintainable**: Easy to understand and modify
- **Safe**: Built-in safety features

## 🚨 Important Notes

### For Production
- Migrations run automatically during build
- No manual intervention needed
- Database is updated before app deployment
- If migration fails, build fails (prevents broken deployment)

### For Development
- Use `npm run migrate:status` to check status
- Use `npm run db:push` for rapid schema changes
- Use `npm run migrate:reset` only in development

## 🔧 Troubleshooting

### If Migration Fails
1. Check error message in build logs
2. Verify database connection
3. Check if tables already exist
4. Contact support if needed

### If Build Fails
1. Migration failure will cause build failure
2. Fix migration issue first
3. Redeploy after fixing

## 📈 Next Steps

After successful deployment:
1. ✅ Analytics tables will be created
2. ✅ Logo column will be added
3. ✅ Analytics feature will work
4. ✅ Portfolio cards will display
5. ✅ All features will be available
