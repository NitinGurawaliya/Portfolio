const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateProjectViews() {
  try {
    console.log('🔄 Populating ProjectView data from DailyProjectViews...')
    
    // Get all daily project views
    const dailyViews = await prisma.dailyProjectViews.findMany({
      select: {
        portfolioId: true,
        projectId: true,
        projectName: true,
        date: true,
        views: true
      }
    })
    
    console.log(`📊 Found ${dailyViews.length} daily view records`)
    
    // Create ProjectView records for each view
    let totalViewsCreated = 0
    
    for (const dailyView of dailyViews) {
      // Create individual view records for each view count
      for (let i = 0; i < dailyView.views; i++) {
        await prisma.projectView.create({
          data: {
            portfolioId: dailyView.portfolioId,
            projectId: dailyView.projectId,
            projectName: dailyView.projectName,
            viewedAt: new Date(dailyView.date.getTime() + i * 1000) // Spread views throughout the day
          }
        })
        totalViewsCreated++
      }
    }
    
    console.log(`✅ Created ${totalViewsCreated} ProjectView records`)
    
    // Verify the data
    const projectViewCount = await prisma.projectView.count()
    console.log(`📈 Total ProjectView records: ${projectViewCount}`)
    
  } catch (error) {
    console.error('❌ Error populating ProjectView data:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

populateProjectViews()
