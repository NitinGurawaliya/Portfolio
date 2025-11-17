const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDetailedAnalyticsTables() {
  try {
    console.log('🔧 Adding detailed analytics tables...');
    
    // Check if tables already exist
    const existingTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ProjectClick', 'SocialClick', 'PortfolioSession');
    `;
    
    console.log('📋 Existing tables:', existingTables.map(t => t.table_name));
    
    // Create ProjectClick table
    if (!existingTables.some(t => t.table_name === 'ProjectClick')) {
      console.log('➕ Creating ProjectClick table...');
      await prisma.$executeRaw`
        CREATE TABLE "ProjectClick" (
          "id" SERIAL PRIMARY KEY,
          "portfolioId" INTEGER NOT NULL,
          "projectId" INTEGER NOT NULL,
          "projectName" TEXT NOT NULL,
          "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "referrer" TEXT
        );
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "ProjectClick_portfolioId_idx" ON "ProjectClick"("portfolioId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "ProjectClick_projectId_idx" ON "ProjectClick"("projectId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "ProjectClick_clickedAt_idx" ON "ProjectClick"("clickedAt");
      `;
      
      console.log('✅ ProjectClick table created');
    } else {
      console.log('✅ ProjectClick table already exists');
    }
    
    // Create SocialClick table
    if (!existingTables.some(t => t.table_name === 'SocialClick')) {
      console.log('➕ Creating SocialClick table...');
      await prisma.$executeRaw`
        CREATE TABLE "SocialClick" (
          "id" SERIAL PRIMARY KEY,
          "portfolioId" INTEGER NOT NULL,
          "socialType" TEXT NOT NULL,
          "socialUrl" TEXT NOT NULL,
          "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "referrer" TEXT
        );
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "SocialClick_portfolioId_idx" ON "SocialClick"("portfolioId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "SocialClick_socialType_idx" ON "SocialClick"("socialType");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "SocialClick_clickedAt_idx" ON "SocialClick"("clickedAt");
      `;
      
      console.log('✅ SocialClick table created');
    } else {
      console.log('✅ SocialClick table already exists');
    }
    
    // Create PortfolioSession table
    if (!existingTables.some(t => t.table_name === 'PortfolioSession')) {
      console.log('➕ Creating PortfolioSession table...');
      await prisma.$executeRaw`
        CREATE TABLE "PortfolioSession" (
          "id" SERIAL PRIMARY KEY,
          "portfolioId" INTEGER NOT NULL,
          "sessionId" TEXT NOT NULL UNIQUE,
          "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "endTime" TIMESTAMP(3),
          "timeSpent" INTEGER,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "referrer" TEXT
        );
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioSession_portfolioId_idx" ON "PortfolioSession"("portfolioId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioSession_sessionId_idx" ON "PortfolioSession"("sessionId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "PortfolioSession_startTime_idx" ON "PortfolioSession"("startTime");
      `;
      
      console.log('✅ PortfolioSession table created');
    } else {
      console.log('✅ PortfolioSession table already exists');
    }
    
    console.log('🎉 Detailed analytics tables setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up detailed analytics tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addDetailedAnalyticsTables();
