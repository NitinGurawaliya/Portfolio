const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProductionDB() {
  try {
    console.log('🔍 Testing production database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Check if analytics tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ProjectClick', 'DailyProjectViews', 'ProjectView', 'PortfolioView')
    `
    
    console.log('📊 Analytics tables found:', tables)
    
    // Check data counts
    const projectClicks = await prisma.projectClick.count()
    const dailyViews = await prisma.dailyProjectViews.count()
    const projectViews = await prisma.projectView.count()
    const portfolioViews = await prisma.portfolioView.count()
    
    console.log('📈 Data counts:')
    console.log(`  - Project Clicks: ${projectClicks}`)
    console.log(`  - Daily Project Views: ${dailyViews}`)
    console.log(`  - Project Views: ${projectViews}`)
    console.log(`  - Portfolio Views: ${portfolioViews}`)
    
    // Check if we have any portfolios
    const portfolios = await prisma.portfolio.findMany({
      select: { id: true, displayName: true, customUsername: true }
    })
    
    console.log('👤 Portfolios found:', portfolios.length)
    if (portfolios.length > 0) {
      console.log('  - Portfolio IDs:', portfolios.map(p => p.id))
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testProductionDB()
