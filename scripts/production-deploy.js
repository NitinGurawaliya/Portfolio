const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

// Production database configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function productionDeploy() {
  try {
    console.log('🚀 Starting production deployment...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // 1. Check database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // 2. Run Prisma migrations
    console.log('📦 Running Prisma migrations...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Prisma migrations completed');
    } catch (error) {
      console.error('❌ Prisma migration failed:', error.message);
      throw error;
    }
    
    // 3. Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Prisma client generated');
    } catch (error) {
      console.error('❌ Prisma client generation failed:', error.message);
      throw error;
    }
    
    // 4. Validate database schema
    console.log('🔍 Validating database schema...');
    try {
      execSync('node scripts/validate-database-schema.js', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Database schema validated');
    } catch (error) {
      console.error('❌ Schema validation failed:', error.message);
      throw error;
    }
    
    // 5. Run safe production migration for any missing columns/tables
    console.log('🛠️ Running safe production migration...');
    try {
      execSync('node scripts/safe-production-migration.js', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Safe production migration completed');
    } catch (error) {
      console.error('❌ Safe migration failed:', error.message);
      throw error;
    }
    
    console.log('🎉 Production deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Production deployment failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please set your production database URL:');
  console.log('export DATABASE_URL="postgresql://username:password@host:port/database"');
  process.exit(1);
}

productionDeploy();
