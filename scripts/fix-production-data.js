const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProductionData() {
  try {
    console.log('🔧 Fixing production data...\n')
    
    // Check DailyProjectViews
    const dailyViews = await prisma.dailyProjectViews.findMany({
      where: { portfolioId: 1 },
      select: {
        id: true,
        portfolioId: true,
        projectId: true,
        projectName: true,
        date: true,
        views: true
      }
    })
    
    console.log(`📊 Found ${dailyViews.length} daily views for portfolio 1`)
    
    // Check ProjectClick
    const projectClicks = await prisma.projectClick.findMany({
      where: { portfolioId: 1 },
      select: {
        id: true,
        portfolioId: true,
        projectId: true,
        projectName: true,
        clickedAt: true
      }
    })
    
    console.log(`📊 Found ${projectClicks.length} project clicks for portfolio 1`)
    
    // Check PortfolioRepository
    const portfolioRepos = await prisma.portfolioRepository.findMany({
      where: { portfolioId: 1 },
      select: {
        id: true,
        repositoryId: true,
        repository: {
          select: {
            id: true,
            githubId: true,
            name: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${portfolioRepos.length} portfolio repositories`)
    
    // Create mapping
    const portfolioRepoMap = {}
    portfolioRepos.forEach(pr => {
      portfolioRepoMap[pr.id] = pr.repository.githubId
    })
    
    console.log('\n📊 Portfolio Repository Mapping:')
    Object.keys(portfolioRepoMap).forEach(id => {
      console.log(`  ID ${id} -> GitHub ID ${portfolioRepoMap[id]}`)
    })
    
    // Group project clicks by date and portfolio repository ID
    const clicksByDate = {}
    
    projectClicks.forEach(click => {
      const portfolioRepoId = Number(click.projectId)
      const date = click.clickedAt.toISOString().split('T')[0]
      const key = `${click.portfolioId}-${portfolioRepoId}-${date}`
      
      if (!clicksByDate[key]) {
        clicksByDate[key] = {
          portfolioId: click.portfolioId,
          projectId: portfolioRepoId,
          projectName: click.projectName,
          date: new Date(date),
          views: 0
        }
      }
      clicksByDate[key].views++
    })
    
    console.log(`\n📊 Created ${Object.keys(clicksByDate).length} daily view entries from clicks`)
    
    // Insert or update DailyProjectViews
    let upserted = 0
    for (const [key, data] of Object.entries(clicksByDate)) {
      try {
        await prisma.dailyProjectViews.upsert({
          where: {
            portfolioId_projectId_date: {
              portfolioId: data.portfolioId,
              projectId: BigInt(data.projectId),
              date: data.date
            }
          },
          update: {
            views: data.views,
            updatedAt: new Date()
          },
          create: {
            portfolioId: data.portfolioId,
            projectId: BigInt(data.projectId),
            projectName: data.projectName,
            date: data.date,
            views: data.views
          }
        })
        upserted++
      } catch (error) {
        console.error(`❌ Error upserting ${key}:`, error.message)
      }
    }
    
    console.log(`\n✅ Successfully upserted ${upserted} daily view entries`)
    
    // Verify final data
    const finalDailyViews = await prisma.dailyProjectViews.findMany({
      where: { portfolioId: 1 },
      orderBy: { date: 'desc' }
    })
    
    console.log(`\n📊 Final daily views count: ${finalDailyViews.length}`)
    console.log('\n📊 Sample data:')
    finalDailyViews.slice(0, 5).forEach(dv => {
      console.log(`  Date: ${dv.date.toISOString().split('T')[0]}, Project ID: ${dv.projectId}, Views: ${dv.views}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductionData()
