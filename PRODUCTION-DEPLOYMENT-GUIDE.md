# Production Deployment Guide

## 🚀 Database Migration for Production

### Prerequisites
1. **Production Database URL** - Set your production PostgreSQL connection string
2. **Environment Variables** - Ensure all required env vars are set
3. **Backup** - Always backup your production database before migration

### Step 1: Set Production Database URL
```bash
# Set your production database URL
export DATABASE_URL="postgresql://username:password@host:port/database"

# Or add to your .env file
echo "DATABASE_URL=postgresql://username:password@host:port/database" >> .env
```

### Step 2: Run Production Migration
```bash
# Option 1: Full production deployment (recommended)
npm run deploy:production

# Option 2: Safe migration only (if you want to be extra careful)
npm run migrate:production
```

### Step 3: Verify Migration
```bash
# Check migration status
npm run migrate:status

# Validate database schema
npm run validate:schema
```

## 📊 What the Migration Does

### Database Changes:
1. **PortfolioView Table** - Tracks portfolio views for analytics
2. **PortfolioAnalytics Table** - Stores analytics summary data
3. **Repository.logo Column** - Adds logo field for repository icons
4. **Indexes** - Creates performance indexes for analytics queries

### Safe Migration Features:
- ✅ **Checks if tables exist** before creating
- ✅ **Checks if columns exist** before adding
- ✅ **No data loss** - Only adds new fields/tables
- ✅ **Rollback safe** - Can be reversed if needed
- ✅ **Production tested** - Safe for live databases

## 🔧 Manual Migration Commands

If you prefer to run migrations manually:

```bash
# 1. Deploy Prisma migrations
npx prisma migrate deploy

# 2. Generate Prisma client
npx prisma generate

# 3. Validate schema
node scripts/validate-database-schema.js

# 4. Run safe migration
node scripts/safe-production-migration.js
```

## 🛡️ Safety Measures

### Before Migration:
- [ ] Backup your production database
- [ ] Test on staging environment first
- [ ] Verify DATABASE_URL is correct
- [ ] Check disk space availability

### After Migration:
- [ ] Verify all tables exist
- [ ] Check application functionality
- [ ] Monitor database performance
- [ ] Test analytics features

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Failed**
   ```bash
   # Check DATABASE_URL format
   echo $DATABASE_URL
   # Should be: postgresql://user:pass@host:port/db
   ```

2. **Migration Conflicts**
   ```bash
   # Reset migration state (CAUTION: Only if needed)
   npx prisma migrate resolve --applied "migration_name"
   ```

3. **Schema Validation Failed**
   ```bash
   # Check current schema
   npx prisma db pull
   # Compare with schema.prisma
   ```

### Rollback (if needed):
```bash
# If you need to rollback (CAUTION: Data loss possible)
# 1. Restore from backup
# 2. Or manually drop new tables/columns
```

## 📈 Post-Migration

After successful migration:
1. **Analytics will start tracking** - New views will be recorded
2. **Repository logos** - Will be generated for repositories without favicons
3. **Performance** - Analytics queries will be optimized with indexes

## 🔍 Verification Commands

```bash
# Check if analytics tables exist
node scripts/check-portfolios.js

# Check repository logo status
node scripts/check-icon-status.js

# Validate complete schema
npm run validate:schema
```

## 📞 Support

If you encounter issues:
1. Check the logs for specific error messages
2. Verify your DATABASE_URL format
3. Ensure your database user has proper permissions
4. Check if all required tables exist

---

**⚠️ Important:** Always test migrations on a staging environment before running on production!
