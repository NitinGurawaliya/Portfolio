const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Cleanup orphaned analytics data that references non-existent PortfolioRepositories
 * This should be run periodically to maintain data integrity
 */
async function cleanupOrphanedAnalytics() {
  console.log('🧹 Starting orphaned analytics cleanup...\n')

  try {
    // Find orphaned DailyProjectViews
    const orphanedDailyViews = await prisma.$queryRaw`
      SELECT d.id, d."portfolioId", d."projectId", d."projectName"
      FROM "DailyProjectViews" d
      WHERE NOT EXISTS (
        SELECT 1 FROM "PortfolioRepository" pr 
        WHERE pr.id = d."projectId"
      )
    `

    console.log(`Found ${orphanedDailyViews.length} orphaned DailyProjectViews entries`)

    if (orphanedDailyViews.length > 0) {
      // Delete orphaned daily views
      const deletedDaily = await prisma.$executeRaw`
        DELETE FROM "DailyProjectViews"
        WHERE NOT EXISTS (
          SELECT 1 FROM "PortfolioRepository" pr 
          WHERE pr.id = "DailyProjectViews"."projectId"
        )
      `
      
      console.log(`✅ Deleted ${deletedDaily} orphaned DailyProjectViews entries`)
    }

    // Find orphaned ProjectClicks
    const orphanedClicks = await prisma.$queryRaw`
      SELECT c.id, c."portfolioId", c."projectId", c."projectName"
      FROM "ProjectClick" c
      WHERE NOT EXISTS (
        SELECT 1 FROM "PortfolioRepository" pr 
        WHERE pr.id = c."projectId"
      )
    `

    console.log(`Found ${orphanedClicks.length} orphaned ProjectClick entries`)

    if (orphanedClicks.length > 0) {
      // Delete orphaned clicks
      const deletedClicks = await prisma.$executeRaw`
        DELETE FROM "ProjectClick"
        WHERE NOT EXISTS (
          SELECT 1 FROM "PortfolioRepository" pr 
          WHERE pr.id = "ProjectClick"."projectId"
        )
      `
      
      console.log(`✅ Deleted ${deletedClicks} orphaned ProjectClick entries`)
    }

    console.log('\n✅ Cleanup complete!')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupOrphanedAnalytics()

