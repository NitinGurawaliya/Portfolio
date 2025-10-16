const { execSync } = require('child_process');

console.log('🚀 Running migrations for production...');

try {
  // This will use the DATABASE_URL from Vercel environment
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Vercel will automatically provide DATABASE_URL
    }
  });
  
  console.log('✅ Migrations deployed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
