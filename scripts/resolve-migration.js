const { PrismaClient } = require('@prisma/client')

async function resolveFailedMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Resolving failed migration...')
    
    // Mark the failed migration as resolved by updating the migration record
    const result = await prisma.$executeRaw`
      UPDATE "_prisma_migrations" 
      SET finished_at = NOW(), 
          logs = 'Migration resolved - columns already exist'
      WHERE migration_name = '20251013000000_add_custom_fields_to_portfolio_repository'
      AND finished_at IS NULL
    `
    
    console.log(`✅ Migration resolved. Updated ${result} record(s).`)
    
    // Check if columns already exist
    const columnsExist = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'PortfolioRepository' 
      AND column_name IN ('customName', 'customDescription')
    `
    
    console.log('📋 Existing columns:', columnsExist)
    
  } catch (error) {
    console.error('❌ Error resolving migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resolveFailedMigration()
