const { PrismaClient } = require('prisma/client')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// Check if production environment is specified
const env = process.argv[2] || 'development'
const envFile = env === 'production' ? '.env.production' : '.env.local'

console.log(`📊 Environment: ${env}`)
console.log(`📁 Loading env from: ${envFile}`)

// Load environment-specific config
const fs = require('fs')
if (fs.existsSync(path.resolve(__dirname, `../${envFile}`))) {
  require('dotenv').config({ path: path.resolve(__dirname, `../${envFile}`) })
  console.log(`✅ Loaded ${envFile}`)
} else {
  console.log(`⚠️  ${envFile} not found, using default .env`)
}

const prisma = new PrismaClient()

async function checkProductionAnalyticsData() {
  console.log('\n🔍 Checking production analytics data...\n')

  try {
    // 1. Check PortfolioRepository table
    const portfolioRepos = await prisma.portfolioRepository.findMany({
      select: {
        id: true,
        portfolioId: true,
        repository: {
          select: {
            id: true,
            githubId: true,
            name: true
          }
        }
      },
      take: 10
    })

    console.log('📊 Sample PortfolioRepository data:')
    portfolioRepos.forEach(pr => {
      console.log({
        portfolioRepositoryId: pr.id,
        portfolioId: pr.portfolioId,
        repositoryId: pr.repository.id,
        repositoryGithubId: pr.repository.githubId.toString(),
        repositoryName: pr.repository.name
      })
    })
    console.log(`\nTotal PortfolioRepositories: ${portfolioRepos.length}\n`)

    // 2. Check DailyProjectViews table
    const dailyViews = await prisma.dailyProjectViews.findMany({
      select: {
        id: true,
        portfolioId: true,
        projectId: true,
        projectName: true,
        date: true,
        views: true
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📊 Sample DailyProjectViews data:')
    const projectIdValues = new Set()
    dailyViews.forEach(view => {
      const projectIdStr = view.projectId.toString()
      projectIdValues.add(projectIdStr)
      console.log({
        id: view.id,
        portfolioId: view.portfolioId,
        projectId: projectIdStr,
        projectName: view.projectName,
        date: view.date,
        views: view.views
      })
    })
    console.log(`\nTotal DailyProjectViews: ${dailyViews.length}`)
    console.log(`Unique projectId values: ${Array.from(projectIdValues).join(', ')}\n`)

    // 3. Check if projectId values match PortfolioRepository IDs or GitHub IDs
    console.log('🔍 Analyzing projectId values...')
    const matchingPortfolioRepos = []
    const matchingRepositories = []

    for (const projectIdStr of projectIdValues) {
      const projectId = BigInt(projectIdStr)
      
      // Check if it matches a PortfolioRepository ID
      const portfolioRepo = await prisma.portfolioRepository.findUnique({
        where: { id: Number(projectId) },
        select: { id: true, portfolioId: true }
      })

      if (portfolioRepo) {
        matchingPortfolioRepos.push({
          projectId: projectIdStr,
          isPortfolioRepositoryId: true,
          portfolioRepoId: portfolioRepo.id,
          portfolioId: portfolioRepo.portfolioId
        })
      } else {
        // Check if it matches a Repository GitHub ID
        const repository = await prisma.repository.findUnique({
          where: { githubId: projectId },
          select: { id: true, githubId: true, name: true }
        })

        if (repository) {
          matchingRepositories.push({
            projectId: projectIdStr,
            isGitHubId: true,
            repositoryId: repository.id,
            repositoryGithubId: repository.githubId.toString(),
            repositoryName: repository.name
          })
        } else {
          console.log(`⚠️  Warning: projectId ${projectIdStr} doesn't match any PortfolioRepository or Repository!`)
        }
      }
    }

    console.log('\n✅ Matching PortfolioRepository IDs:')
    matchingPortfolioRepos.forEach(m => console.log(m))

    console.log('\n⚠️  Matching GitHub IDs (needs migration):')
    matchingRepositories.forEach(m => console.log(m))

    // 4. Determine migration need
    console.log('\n📋 Migration Recommendation:')
    if (matchingRepositories.length > 0) {
      console.log('❌ MIGRATION NEEDED: Some projectId values are GitHub IDs and should be converted to PortfolioRepository IDs')
      console.log(`   Affected records: ${matchingRepositories.length}`)
      
      console.log('\n💡 Migration Strategy:')
      console.log('   1. For each DailyProjectViews record with GitHub ID as projectId:')
      console.log('      - Find the Repository by githubId')
      console.log('      - Find the PortfolioRepository by portfolioId + repositoryId')
      console.log('      - Update projectId to use PortfolioRepository ID')
    } else {
      console.log('✅ NO MIGRATION NEEDED: All projectId values are already PortfolioRepository IDs')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionAnalyticsData()

