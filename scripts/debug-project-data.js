const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugProjectData() {
  try {
    console.log('🔍 Debugging project data for portfolio ID 1...')
    
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
    
    console.log('📊 Portfolio repositories:', portfolioRepos)
    
    // Check daily project views for each repository
    for (const repo of portfolioRepos) {
      console.log(`\n🔍 Checking data for repository: ${repo.repository.name}`)
      console.log(`  - Portfolio Repo ID: ${repo.id}`)
      console.log(`  - Repository ID: ${repo.repository.id}`)
      console.log(`  - GitHub ID: ${repo.repository.githubId}`)
      
      // Check daily project views
      const dailyViews = await prisma.dailyProjectViews.findMany({
        where: {
          portfolioId: 1,
          projectId: BigInt(repo.id)
        },
        orderBy: { date: 'desc' },
        take: 7
      })
      
      console.log(`  - Daily views count: ${dailyViews.length}`)
      if (dailyViews.length > 0) {
        console.log(`  - Latest views:`, dailyViews[0])
      }
      
      // Check project clicks
      const projectClicks = await prisma.projectClick.findMany({
        where: {
          portfolioId: 1,
          projectId: BigInt(repo.repository.githubId)
        },
        orderBy: { clickedAt: 'desc' },
        take: 5
      })
      
      console.log(`  - Project clicks count: ${projectClicks.length}`)
      if (projectClicks.length > 0) {
        console.log(`  - Latest click:`, projectClicks[0])
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugProjectData()
