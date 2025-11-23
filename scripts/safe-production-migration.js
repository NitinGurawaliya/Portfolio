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
    
    // 4. Safely add CustomDomain table if it doesn't exist
    const customDomainTableExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'CustomDomain';
    `;
    
    if (customDomainTableExists.length === 0) {
      console.log('➕ Creating CustomDomain table...');
      await prisma.$executeRaw`
        CREATE TABLE "CustomDomain" (
          "id" TEXT NOT NULL,
          "domain" TEXT NOT NULL,
          "portfolioId" INTEGER NOT NULL,
          "userId" INTEGER NOT NULL,
          "verified" BOOLEAN NOT NULL DEFAULT FALSE,
          "verificationToken" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "lastCheckedAt" TIMESTAMP(3),
          CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
        );
      `;
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");
      `;
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "CustomDomain_portfolioId_key" ON "CustomDomain"("portfolioId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "CustomDomain_verified_idx" ON "CustomDomain"("verified");
      `;
      
      // Add foreign keys only if Portfolio and User tables exist
      const portfolioTableExists = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Portfolio';
      `;
      
      const userTableExists = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'User';
      `;
      
      if (portfolioTableExists.length > 0) {
        await prisma.$executeRaw`
          ALTER TABLE "CustomDomain" 
          ADD CONSTRAINT "CustomDomain_portfolioId_fkey" 
          FOREIGN KEY ("portfolioId") 
          REFERENCES "Portfolio"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        `;
        console.log('✅ CustomDomain -> Portfolio foreign key added');
      }
      
      if (userTableExists.length > 0) {
        await prisma.$executeRaw`
          ALTER TABLE "CustomDomain" 
          ADD CONSTRAINT "CustomDomain_userId_fkey" 
          FOREIGN KEY ("userId") 
          REFERENCES "User"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        `;
        console.log('✅ CustomDomain -> User foreign key added');
      }
      
      console.log('✅ CustomDomain table created');
    } else {
      console.log('✅ CustomDomain table already exists');
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
