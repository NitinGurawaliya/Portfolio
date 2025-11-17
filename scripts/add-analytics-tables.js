const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAnalyticsTables() {
  try {
    console.log('🔧 Adding analytics tables...');
    
    // Check if PortfolioView table exists
    const viewTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioView'
      );
    `;
    
    if (!viewTableExists[0].exists) {
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
      
      console.log('✅ PortfolioView table created.');
    } else {
      console.log('✅ PortfolioView table already exists.');
    }
    
    // Check if PortfolioAnalytics table exists
    const analyticsTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioAnalytics'
      );
    `;
    
    if (!analyticsTableExists[0].exists) {
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
      
      console.log('✅ PortfolioAnalytics table created.');
    } else {
      console.log('✅ PortfolioAnalytics table already exists.');
    }
    
    console.log('🎉 Analytics tables migration completed!');
    
  } catch (error) {
    console.error('❌ Error adding analytics tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addAnalyticsTables();
