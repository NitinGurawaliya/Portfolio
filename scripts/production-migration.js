const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function runProductionMigration() {
  try {
    console.log('🚀 Starting production migration...')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ProjectClick', 'DailyProjectViews', 'ProjectView')
    `
    
    console.log('📊 Existing tables:', tables.map(t => t.table_name))
    
    // If tables don't exist, we need to run migrations
    if (tables.length < 3) {
      console.log('❌ Analytics tables missing. Please run: npx prisma migrate deploy')
      return
    }
    
    // Check if we have any data
    const projectClicks = await prisma.projectClick.count()
    const dailyViews = await prisma.dailyProjectViews.count()
    
    console.log(`📈 Current data: ${projectClicks} project clicks, ${dailyViews} daily views`)
    
    // If no daily views but we have project clicks, migrate data
    if (dailyViews === 0 && projectClicks > 0) {
      console.log('🔄 Migrating project clicks to daily views...')
      
      // Get all unique project clicks
      const clicks = await prisma.projectClick.findMany({
        select: {
          portfolioId: true,
          projectId: true,
          projectName: true,
          clickedAt: true
        }
      })
      
      // Group by date and project
      const dailyData = {}
      clicks.forEach(click => {
        const date = click.clickedAt.toISOString().split('T')[0]
        const key = `${click.portfolioId}-${click.projectId}-${date}`
        
        if (!dailyData[key]) {
          dailyData[key] = {
            portfolioId: click.portfolioId,
            projectId: click.projectId,
            projectName: click.projectName,
            date: new Date(date),
            views: 0
          }
        }
        dailyData[key].views++
      })
      
      // Insert daily views
      for (const key in dailyData) {
        const data = dailyData[key]
        await prisma.dailyProjectViews.upsert({
          where: {
            portfolioId_projectId_date: {
              portfolioId: data.portfolioId,
              projectId: data.projectId,
              date: data.date
            }
          },
          update: { views: data.views },
          create: data
        })
      }
      
      console.log(`✅ Migrated ${Object.keys(dailyData).length} daily view records`)
    }
    
    // Add some test data if no data exists
    if (dailyViews === 0 && projectClicks === 0) {
      console.log('🧪 Adding test data...')
      
      // Get first portfolio
      const portfolio = await prisma.portfolio.findFirst()
      if (portfolio) {
        // Add test project clicks
        const testClicks = []
        for (let i = 0; i < 10; i++) {
          testClicks.push({
            portfolioId: portfolio.id,
            projectId: BigInt(1000000 + i),
            projectName: `Test Project ${i + 1}`,
            clickedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Last 10 days
          })
        }
        
        await prisma.projectClick.createMany({
          data: testClicks
        })
        
        console.log('✅ Added 10 test project clicks')
      }
    }
    
    console.log('🎉 Production migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

runProductionMigration()