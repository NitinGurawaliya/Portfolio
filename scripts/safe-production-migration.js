const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeProductionMigration() {
  try {
    console.log('🔧 Running safe production migration...');
    
    // 1. Check if tables exist before creating
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;
    
    console.log('📋 Existing tables:', tables.map(t => t.table_name));
    
    // 2. Safely add logo column if it doesn't exist
    const logoColumnExists = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'Repository'
      AND column_name = 'logo';
    `;
    
    if (logoColumnExists.length === 0) {
      console.log('➕ Adding logo column to Repository table...');
      await prisma.$executeRaw`ALTER TABLE "Repository" ADD COLUMN "logo" TEXT;`;
      console.log('✅ Logo column added');
    } else {
      console.log('✅ Logo column already exists');
    }
    
    // 3. Safely add analytics tables if they don't exist
    const analyticsTableExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'PortfolioView';
    `;
    
    if (analyticsTableExists.length === 0) {
      console.log('➕ Creating PortfolioView table...');
      await prisma.$executeRaw`
        CREATE TABLE "PortfolioView" (
          "id" SERIAL PRIMARY KEY,
          "portfolioId" INTEGER NOT NULL,
          "userId" INTEGER NOT NULL,
          "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "referrer" TEXT
        );
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioView_portfolioId_idx" ON "PortfolioView"("portfolioId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioView_userId_idx" ON "PortfolioView"("userId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioView_viewedAt_idx" ON "PortfolioView"("viewedAt");
      `;
      
      console.log('✅ PortfolioView table created');
    } else {
      console.log('✅ PortfolioView table already exists');
    }
    
    const analyticsSummaryExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'PortfolioAnalytics';
    `;
    
    if (analyticsSummaryExists.length === 0) {
      console.log('➕ Creating PortfolioAnalytics table...');
      await prisma.$executeRaw`
        CREATE TABLE "PortfolioAnalytics" (
          "id" SERIAL PRIMARY KEY,
          "portfolioId" INTEGER NOT NULL UNIQUE,
          "totalViews" INTEGER NOT NULL DEFAULT 0,
          "lastViewedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioAnalytics_portfolioId_idx" ON "PortfolioAnalytics"("portfolioId");
      `;
      
      console.log('✅ PortfolioAnalytics table created');
    } else {
      console.log('✅ PortfolioAnalytics table already exists');
    }
    
    console.log('🎉 Safe production migration completed!');
    
  } catch (error) {
    console.error('❌ Error during safe migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

safeProductionMigration();
