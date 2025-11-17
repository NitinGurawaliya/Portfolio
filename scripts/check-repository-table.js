const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRepositoryTable() {
  try {
    console.log('🔍 Checking Repository table structure...');
    
    // Check if logo column exists
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'Repository'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Repository table columns:');
    result.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check if logo column exists specifically
    const logoExists = result.find(col => col.column_name === 'logo');
    if (logoExists) {
      console.log('\n✅ Logo column exists');
    } else {
      console.log('\n❌ Logo column does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking Repository table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRepositoryTable();
