const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductionAnalytics() {
  try {
    console.log('🔧 Fixing production analytics data...');
    
    // Get all portfolios
    const portfolios = await prisma.portfolio.findMany({
      select: { id: true }
    });
    
    console.log(`📊 Found ${portfolios.length} portfolios`);
    
    for (const portfolio of portfolios) {
      console.log(`\n🔄 Processing portfolio ${portfolio.id}...`);
      
      // Get existing analytics
      const existingAnalytics = await prisma.portfolioAnalytics.findUnique({
        where: { portfolioId: portfolio.id }
      });
      
      if (!existingAnalytics) {
        console.log(`➕ Creating analytics for portfolio ${portfolio.id}`);
        
        // Create analytics record
        await prisma.portfolioAnalytics.create({
          data: {
            portfolioId: portfolio.id,
            totalViews: 0,
            lastViewedAt: null
          }
        });
      }
      
      // Get views for this portfolio
      const views = await prisma.portfolioView.findMany({
        where: { portfolioId: portfolio.id },
        select: { viewedAt: true }
      });
      
      console.log(`📈 Found ${views.length} views for portfolio ${portfolio.id}`);
      
      // Update analytics with correct data
      const totalViews = views.length;
      const lastViewedAt = views.length > 0 ? views[views.length - 1].viewedAt : null;
      
      await prisma.portfolioAnalytics.upsert({
        where: { portfolioId: portfolio.id },
        create: {
          portfolioId: portfolio.id,
          totalViews,
          lastViewedAt
        },
        update: {
          totalViews,
          lastViewedAt
        }
      });
      
      console.log(`✅ Updated analytics for portfolio ${portfolio.id} - ${totalViews} views`);
    }
    
    console.log('\n🎉 Production analytics fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionAnalytics();
