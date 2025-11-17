const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addLogoColumn() {
  try {
    console.log('🔧 Adding logo column to Repository table...');
    
    // Check if logo column already exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Repository' AND column_name = 'logo'
    `;
    
    if (result.length > 0) {
      console.log('✅ Logo column already exists');
      return;
    }
    
    // Add the logo column
    await prisma.$executeRaw`
      ALTER TABLE "public"."Repository" ADD COLUMN "logo" TEXT
    `;
    
    console.log('✅ Logo column added successfully');
    
  } catch (error) {
    console.error('❌ Error adding logo column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addLogoColumn();
