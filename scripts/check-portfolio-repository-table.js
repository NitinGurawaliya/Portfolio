const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPortfolioRepositoryTable() {
  try {
    console.log('🔍 Checking PortfolioRepository table structure...');
    
    // Check if custom columns exist
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'PortfolioRepository'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 PortfolioRepository table columns:');
    result.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check for missing columns
    const missingColumns = ['customName', 'customDescription', 'displayOrder', 'technologies'];
    missingColumns.forEach(col => {
      const exists = result.find(r => r.column_name === col);
      if (exists) {
        console.log(`✅ ${col} column exists`);
      } else {
        console.log(`❌ ${col} column missing`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking PortfolioRepository table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPortfolioRepositoryTable();
