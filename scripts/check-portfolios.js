const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPortfolios() {
  try {
    console.log('🔍 Checking portfolios in database...');
    
    // Check total portfolios
    const totalPortfolios = await prisma.portfolio.count();
    console.log(`📊 Total portfolios: ${totalPortfolios}`);
    
    // Check published portfolios
    const publishedPortfolios = await prisma.portfolio.count({
      where: {
        isPublished: true
      }
    });
    console.log(`✅ Published portfolios: ${publishedPortfolios}`);
    
    // Check portfolios with complete data
    const completePortfolios = await prisma.portfolio.count({
      where: {
        isPublished: true,
        displayName: { not: null },
        profilePic: { not: null },
        customUsername: { not: null }
      }
    });
    console.log(`🎯 Complete portfolios: ${completePortfolios}`);
    
    // Show some examples
    const portfolios = await prisma.portfolio.findMany({
      select: {
        id: true,
        isPublished: true,
        displayName: true,
        customUsername: true,
        profilePic: true,
        user: {
          select: {
            githubUsername: true
          }
        }
      },
      take: 5
    });
    
    console.log('\n📋 Sample portfolios:');
    portfolios.forEach((portfolio, index) => {
      console.log(`${index + 1}. ID: ${portfolio.id}`);
      console.log(`   Published: ${portfolio.isPublished}`);
      console.log(`   Display Name: ${portfolio.displayName || 'null'}`);
      console.log(`   Custom Username: ${portfolio.customUsername || 'null'}`);
      console.log(`   Profile Pic: ${portfolio.profilePic ? 'exists' : 'null'}`);
      console.log(`   GitHub Username: ${portfolio.user.githubUsername}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking portfolios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPortfolios();
