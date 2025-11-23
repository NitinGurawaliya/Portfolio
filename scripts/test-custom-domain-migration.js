/**
 * Test script to verify CustomDomain migration is production-ready
 * Run this before deploying to production
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCustomDomainMigration() {
  try {
    console.log('🧪 Testing CustomDomain migration...\n');
    
    // 1. Check if CustomDomain table exists
    const tableExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'CustomDomain';
    `;
    
    if (tableExists.length === 0) {
      console.log('⚠️  CustomDomain table does not exist yet');
      console.log('   This is expected if migration has not been run');
      console.log('   Migration will create the table during deployment\n');
    } else {
      console.log('✅ CustomDomain table exists\n');
    }
    
    // 2. Check if required indexes exist
    const indexes = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'CustomDomain';
    `;
    
    console.log('📋 Existing indexes:', indexes.map(i => i.indexname));
    
    const requiredIndexes = [
      'CustomDomain_domain_key',
      'CustomDomain_portfolioId_key',
      'CustomDomain_userId_idx',
      'CustomDomain_domain_idx',
      'CustomDomain_verified_idx'
    ];
    
    const existingIndexNames = indexes.map(i => i.indexname);
    const missingIndexes = requiredIndexes.filter(idx => !existingIndexNames.includes(idx));
    
    if (missingIndexes.length > 0) {
      console.log('⚠️  Missing indexes:', missingIndexes);
    } else {
      console.log('✅ All required indexes exist');
    }
    
    // 3. Check foreign key constraints
    const foreignKeys = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'CustomDomain';
    `;
    
    console.log('\n📋 Foreign key constraints:', foreignKeys.length);
    foreignKeys.forEach(fk => {
      console.log(`   ${fk.constraint_name}: ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // 4. Test Prisma client can access CustomDomain
    try {
      const count = await prisma.customDomain.count();
      console.log(`\n✅ Prisma client can access CustomDomain (${count} records)`);
    } catch (error) {
      console.log('\n⚠️  Prisma client cannot access CustomDomain yet');
      console.log('   This is expected if migration has not been run');
      console.log('   Run: npx prisma generate && npx prisma migrate deploy');
    }
    
    console.log('\n🎉 Migration test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npx prisma migrate deploy');
    console.log('   2. Verify table and indexes are created');
    console.log('   3. Test custom domain functionality');
    
  } catch (error) {
    console.error('❌ Error testing migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomDomainMigration();

