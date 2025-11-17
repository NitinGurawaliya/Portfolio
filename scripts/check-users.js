const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Check total users
    const totalUsers = await prisma.user.count();
    console.log(`👥 Total users: ${totalUsers}`);
    
    // Check repositories
    const totalRepos = await prisma.repository.count();
    console.log(`📚 Total repositories: ${totalRepos}`);
    
    // Show some examples
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        githubUsername: true,
        createdAt: true
      },
      take: 5
    });
    
    console.log('\n📋 Sample users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'null'}`);
      console.log(`   Email: ${user.email || 'null'}`);
      console.log(`   GitHub: ${user.githubUsername || 'null'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
