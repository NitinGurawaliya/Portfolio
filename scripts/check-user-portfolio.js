const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPortfolio() {
  try {
    console.log('🔍 Checking user portfolio data...');
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        githubUsername: 'NitinGurawaliya'
      },
      include: {
        portfolio: true,
        repositories: true
      }
    });
    
    if (user) {
      console.log(`👤 User found: ${user.name} (${user.githubUsername})`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`📅 Created: ${user.createdAt}`);
      
      if (user.portfolio) {
        console.log('\n🎯 Portfolio data:');
        console.log(`   ID: ${user.portfolio.id}`);
        console.log(`   Published: ${user.portfolio.isPublished}`);
        console.log(`   Display Name: ${user.portfolio.displayName || 'null'}`);
        console.log(`   Custom Username: ${user.portfolio.customUsername || 'null'}`);
        console.log(`   Job Title: ${user.portfolio.jobTitle || 'null'}`);
        console.log(`   Bio: ${user.portfolio.bio || 'null'}`);
        console.log(`   Profile Pic: ${user.portfolio.profilePic || 'null'}`);
        console.log(`   Selected Theme: ${user.portfolio.selectedTheme}`);
        console.log(`   Updated: ${user.portfolio.updatedAt}`);
      } else {
        console.log('\n❌ No portfolio found for this user');
      }
      
      console.log(`\n📚 Repositories: ${user.repositories.length}`);
      if (user.repositories.length > 0) {
        user.repositories.forEach((repo, index) => {
          console.log(`   ${index + 1}. ${repo.name} (${repo.language || 'No language'})`);
        });
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking user portfolio:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPortfolio();
