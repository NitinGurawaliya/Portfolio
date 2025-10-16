# Vercel Deployment Guide

## Database Migration for Production

### Problem
Production database में `displayOrder` column missing है, जिससे API error आ रही है:
```
The column `PortfolioRepository.displayOrder` does not exist in the current database.
```

### Solution

#### Option 1: Automatic Migration (Recommended)
1. Push code to GitHub
2. Vercel automatically runs `npm run build` during deployment
3. Build script में already `prisma migrate deploy` है, so migration automatically run होगी

#### Option 2: Manual Migration via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Run migration in production
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

#### Option 3: Manual Migration via Vercel Dashboard
1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to Functions tab
4. Create a new Serverless Function to run migration:

```javascript
// api/migrate.js
const { execSync } = require('child_process');

export default async function handler(req, res) {
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    res.status(200).json({ success: true, message: 'Migration completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### Verification
After migration, check if the column exists:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'PortfolioRepository' 
AND column_name = 'displayOrder';
```

### Rollback (if needed)
```sql
ALTER TABLE "PortfolioRepository" DROP COLUMN "displayOrder";
```

## Environment Variables Required
Make sure these are set in Vercel:
- `DATABASE_URL` - Production database connection string
- `NEXTAUTH_SECRET` - For authentication
- `NEXTAUTH_URL` - Your production URL
