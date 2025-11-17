const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateDatabaseSchema() {
  try {
    console.log('🔍 Validating database schema before deployment...');
    
    const errors = [];
    
    // Check Repository table
    const repoColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'Repository'
      ORDER BY column_name;
    `;
    
    const repoRequiredColumns = ['id', 'name', 'favicon', 'logo', 'githubUrl', 'isImported'];
    const repoExistingColumns = repoColumns.map(col => col.column_name);
    
    repoRequiredColumns.forEach(col => {
      if (!repoExistingColumns.includes(col)) {
        errors.push(`❌ Repository table missing column: ${col}`);
      }
    });
    
    // Check PortfolioRepository table
    const portfolioRepoColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'PortfolioRepository'
      ORDER BY column_name;
    `;
    
    const portfolioRepoRequiredColumns = ['id', 'customName', 'customDescription', 'technologies', 'displayOrder'];
    const portfolioRepoExistingColumns = portfolioRepoColumns.map(col => col.column_name);
    
    portfolioRepoRequiredColumns.forEach(col => {
      if (!portfolioRepoExistingColumns.includes(col)) {
        errors.push(`❌ PortfolioRepository table missing column: ${col}`);
      }
    });
    
    // Check PortfolioView table
    const portfolioViewExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'PortfolioView';
    `;
    
    if (portfolioViewExists.length === 0) {
      errors.push(`❌ PortfolioView table does not exist`);
    }
    
    // Check PortfolioAnalytics table
    const portfolioAnalyticsExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'PortfolioAnalytics';
    `;
    
    if (portfolioAnalyticsExists.length === 0) {
      errors.push(`❌ PortfolioAnalytics table does not exist`);
    }
    
    if (errors.length > 0) {
      console.log('🚨 DATABASE SCHEMA VALIDATION FAILED!');
      console.log('The following issues were found:');
      errors.forEach(error => console.log(error));
      console.log('\n❌ Deployment should be ABORTED until these issues are fixed.');
      process.exit(1);
    } else {
      console.log('✅ Database schema validation passed!');
      console.log('✅ All required tables and columns exist.');
      console.log('✅ Safe to deploy to production.');
    }
    
  } catch (error) {
    console.error('❌ Error validating database schema:', error);
    console.log('❌ Deployment should be ABORTED due to validation error.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateDatabaseSchema();
