const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickIconCheck() {
  try {
    const repos = await prisma.repository.findMany({
      select: {
        name: true,
        favicon: true,
        logo: true,
        isImported: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('🔍 QUICK ICON STATUS CHECK');
    console.log('==========================');
    
    let realFaviconCount = 0;
    let generatedLogoCount = 0;
    
    repos.forEach(repo => {
      const hasRealFavicon = !!repo.favicon;
      const hasGeneratedLogo = !!repo.logo && repo.logo.includes('data:image/svg+xml;base64');
      
      if (hasRealFavicon) {
        console.log(`🎯 ${repo.name}: REAL FAVICON`);
        realFaviconCount++;
      } else if (hasGeneratedLogo) {
        console.log(`🔄 ${repo.name}: Generated Logo`);
        generatedLogoCount++;
      } else {
        console.log(`❌ ${repo.name}: No Icon`);
      }
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`🎯 Real Favicons: ${realFaviconCount}`);
    console.log(`🔄 Generated Logos: ${generatedLogoCount}`);
    console.log(`📊 Total Repositories: ${repos.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickIconCheck();
