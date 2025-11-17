const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkIconStatus() {
  try {
    console.log('🔍 Checking Icon Status for All Repositories...');
    console.log('================================================');
    
    const repos = await prisma.repository.findMany({
      select: {
        id: true,
        name: true,
        favicon: true,
        logo: true,
        isImported: true,
        htmlUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📊 Total Repositories: ${repos.length}\n`);
    
    let realFaviconCount = 0;
    let generatedLogoCount = 0;
    let noIconCount = 0;
    
    repos.forEach(repo => {
      const hasRealFavicon = !!repo.favicon;
      const hasGeneratedLogo = !!repo.logo && repo.logo.includes('data:image/svg+xml;base64');
      const hasNoIcon = !repo.favicon && !repo.logo;
      
      let iconType = '';
      let iconDetails = '';
      
      if (hasRealFavicon) {
        iconType = '🎯 REAL FAVICON';
        iconDetails = `URL: ${repo.favicon}`;
        realFaviconCount++;
      } else if (hasGeneratedLogo) {
        iconType = '🔄 GENERATED LOGO';
        iconDetails = 'Base64 SVG fallback';
        generatedLogoCount++;
      } else {
        iconType = '❌ NO ICON';
        iconDetails = 'No favicon or logo';
        noIconCount++;
      }
      
      const repoType = repo.isImported ? 'Imported' : 'GitHub';
      
      console.log(`${repo.name} (${repoType}):`);
      console.log(`  Status: ${iconType}`);
      console.log(`  Details: ${iconDetails}`);
      console.log('');
    });
    
    console.log('📈 SUMMARY:');
    console.log('===========');
    console.log(`🎯 Real Favicons: ${realFaviconCount}`);
    console.log(`🔄 Generated Logos: ${generatedLogoCount}`);
    console.log(`❌ No Icons: ${noIconCount}`);
    console.log(`📊 Total: ${repos.length}`);
    
    // Show some examples of real favicons
    const reposWithFavicons = repos.filter(r => r.favicon);
    if (reposWithFavicons.length > 0) {
      console.log('\n🎯 REPOSITORIES WITH REAL FAVICONS:');
      console.log('====================================');
      reposWithFavicons.slice(0, 5).forEach(repo => {
        console.log(`• ${repo.name}: ${repo.favicon}`);
      });
      if (reposWithFavicons.length > 5) {
        console.log(`• ... and ${reposWithFavicons.length - 5} more`);
      }
    }
    
    // Show some examples of generated logos
    const reposWithGeneratedLogos = repos.filter(r => r.logo && r.logo.includes('data:image/svg+xml;base64'));
    if (reposWithGeneratedLogos.length > 0) {
      console.log('\n🔄 REPOSITORIES WITH GENERATED LOGOS:');
      console.log('======================================');
      reposWithGeneratedLogos.slice(0, 5).forEach(repo => {
        console.log(`• ${repo.name}: Generated SVG logo`);
      });
      if (reposWithGeneratedLogos.length > 5) {
        console.log(`• ... and ${reposWithGeneratedLogos.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking icon status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIconStatus();
