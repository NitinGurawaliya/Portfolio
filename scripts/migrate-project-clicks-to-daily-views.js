const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateProjectClicksToDailyViews() {
  try {
    console.log('🔄 Starting migration of ProjectClick data to DailyProjectViews...')
    
    // Get all project clicks
    const projectClicks = await prisma.projectClick.findMany({
      orderBy: {
        clickedAt: 'asc'
      }
    })
    
    console.log(`📊 Found ${projectClicks.length} project clicks to migrate`)
    
    // Group clicks by portfolio, project, and date
    const dailyViewsMap = new Map()
    
    for (const click of projectClicks) {
      const date = new Date(click.clickedAt)
      date.setHours(0, 0, 0, 0)
      
      const key = `${click.portfolioId}-${click.projectId}-${date.toISOString().split('T')[0]}`
      
      if (!dailyViewsMap.has(key)) {
        dailyViewsMap.set(key, {
          portfolioId: click.portfolioId,
          projectId: click.projectId,
          projectName: click.projectName,
          date: date,
          views: 0
        })
      }
      
      dailyViewsMap.get(key).views++
    }
    
    console.log(`📅 Created ${dailyViewsMap.size} daily view entries`)
    
    // Insert daily views
    let inserted = 0
    for (const [key, dailyView] of dailyViewsMap) {
      try {
        await prisma.dailyProjectViews.upsert({
          where: {
            portfolioId_projectId_date: {
              portfolioId: dailyView.portfolioId,
              projectId: dailyView.projectId,
              date: dailyView.date
            }
          },
          update: {
            views: dailyView.views,
            updatedAt: new Date()
          },
          create: {
            portfolioId: dailyView.portfolioId,
            projectId: dailyView.projectId,
            projectName: dailyView.projectName,
            date: dailyView.date,
            views: dailyView.views
          }
        })
        inserted++
      } catch (error) {
        console.error(`❌ Error inserting daily view for key ${key}:`, error)
      }
    }
    
    console.log(`✅ Successfully migrated ${inserted} daily view entries`)
    
    // Verify migration
    const totalDailyViews = await prisma.dailyProjectViews.count()
    console.log(`📊 Total daily views in database: ${totalDailyViews}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateProjectClicksToDailyViews()
