const { PrismaClient } = require('@prisma/client')
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

/**
 * Migrates DailyProjectViews and ProjectClick projectId values from GitHub IDs to PortfolioRepository IDs
 */
async function migrateAnalyticsProjectIds() {
  console.log('🔄 Starting analytics projectId migration...\n')

  try {
    // 1. Get all unique projectId values from DailyProjectViews
    const dailyViews = await prisma.dailyProjectViews.findMany({
      distinct: ['projectId'],
      select: {
        projectId: true,
        portfolioId: true
      }
    })

    console.log(`Found ${dailyViews.length} unique projectId values to check\n`)

    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const view of dailyViews) {
      const projectId = view.projectId
      const portfolioId = view.portfolioId

      try {
        // Check if projectId is already a PortfolioRepository ID
        const portfolioRepo = await prisma.portfolioRepository.findUnique({
          where: { id: Number(projectId) },
          select: { 
            id: true,
            portfolioId: true,
            repository: {
              select: { githubId: true }
            }
          }
        })

        if (portfolioRepo && portfolioRepo.portfolioId === portfolioId) {
          // Already a PortfolioRepository ID, skip
          skippedCount++
          continue
        }

        // Try to find if projectId is a GitHub ID
        const repository = await prisma.repository.findUnique({
          where: { githubId: projectId },
          select: { id: true }
        })

        if (!repository) {
          console.log(`⚠️  Could not find repository for GitHub ID ${projectId.toString()}, skipping`)
          skippedCount++
          continue
        }

        // Find the PortfolioRepository for this repository and portfolio
        const portfolioRepository = await prisma.portfolioRepository.findFirst({
          where: {
            portfolioId: portfolioId,
            repositoryId: repository.id
          },
          select: { id: true }
        })

        if (!portfolioRepository) {
          console.log(`⚠️  Could not find PortfolioRepository for portfolioId ${portfolioId} and repositoryId ${repository.id}`)
          skippedCount++
          continue
        }

        const newProjectId = BigInt(portfolioRepository.id)

        // Update all DailyProjectViews records with this projectId
        const updatedDailyViews = await prisma.dailyProjectViews.updateMany({
          where: {
            portfolioId: portfolioId,
            projectId: projectId
          },
          data: {
            projectId: newProjectId
          }
        })

        // Update all ProjectClick records with this projectId
        const updatedProjectClicks = await prisma.projectClick.updateMany({
          where: {
            portfolioId: portfolioId,
            projectId: projectId
          },
          data: {
            projectId: newProjectId
          }
        })

        migratedCount++
        console.log(`✅ Migrated projectId ${projectId.toString()} → ${newProjectId.toString()} (${updatedDailyViews.count} daily views, ${updatedProjectClicks.count} clicks)`)

      } catch (error) {
        console.error(`❌ Error migrating projectId ${projectId.toString()}:`, error.message)
        errorCount++
      }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Migrated: ${migratedCount}`)
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)

  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ask for confirmation before running migration
console.log('⚠️  WARNING: This will update production data!')
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

setTimeout(async () => {
  await migrateAnalyticsProjectIds()
}, 5000)

