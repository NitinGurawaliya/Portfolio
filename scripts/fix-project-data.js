const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixProjectData() {
  try {
    console.log('🔧 Fixing project data for portfolio ID 1...')
    
    // Get all portfolio repositories for portfolio 1
    const portfolioRepos = await prisma.portfolioRepository.findMany({
      where: { portfolioId: 1 },
      select: {
        id: true,
        repository: {
          select: {
            id: true,
            githubId: true,
            name: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${portfolioRepos.length} repositories`)
    
    // For each repository, create daily project views from project clicks
    for (const repo of portfolioRepos) {
      console.log(`\n🔧 Processing repository: ${repo.repository.name}`)
      
      // Get project clicks for this repository
      const projectClicks = await prisma.projectClick.findMany({
        where: {
          portfolioId: 1,
          projectId: BigInt(repo.repository.githubId)
        },
        orderBy: { clickedAt: 'asc' }
      })
      
      console.log(`  - Found ${projectClicks.length} project clicks`)
      
      if (projectClicks.length > 0) {
        // Group clicks by date
        const clicksByDate = {}
        projectClicks.forEach(click => {
          const date = click.clickedAt.toISOString().split('T')[0]
          if (!clicksByDate[date]) {
            clicksByDate[date] = 0
          }
          clicksByDate[date]++
        })
        
        // Create daily project views
        for (const [date, count] of Object.entries(clicksByDate)) {
          await prisma.dailyProjectViews.upsert({
            where: {
              portfolioId_projectId_date: {
                portfolioId: 1,
                projectId: BigInt(repo.id),
                date: new Date(date)
              }
            },
            update: { views: count },
            create: {
              portfolioId: 1,
              projectId: BigInt(repo.id),
              projectName: repo.repository.name,
              date: new Date(date),
              views: count
            }
          })
        }
        
        console.log(`  ✅ Created daily views for ${Object.keys(clicksByDate).length} dates`)
      }
    }
    
    console.log('\n🎉 Project data fix completed!')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixProjectData()
