const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to generate improved logo (same as in extract-metadata route)
function generateLogoBase64(text) {
  // Take first 2 words and clean them, limit to 2 characters max
  const words = text.split(' ').slice(0, 2).filter(word => word.length > 0);
  const logoText = words.map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  
  // Create a small, square SVG with white background and border
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="white" stroke="#e5e7eb" stroke-width="1"/>
      <text x="12" y="16" font-family="Arial, sans-serif" font-size="8" font-weight="600" 
            text-anchor="middle" fill="#374151" letter-spacing="-0.3px">${logoText}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function migrateProductionRepos() {
  try {
    console.log('🚀 Starting production repository migration...');
    
    // Get all repositories
    const repos = await prisma.repository.findMany({
      select: {
        id: true,
        name: true,
        favicon: true,
        logo: true,
        isImported: true
      }
    });
    
    console.log(`📊 Found ${repos.length} repositories to check`);
    
    let updatedCount = 0;
    
    for (const repo of repos) {
      let needsUpdate = false;
      const updates = {};
      
      // Check if repository has favicon but no logo (shouldn't happen, but just in case)
      if (repo.favicon && !repo.logo) {
        console.log(`✅ ${repo.name}: Has favicon, no logo needed`);
        continue;
      }
      
      // Check if repository has neither favicon nor logo
      if (!repo.favicon && !repo.logo) {
        console.log(`🔄 ${repo.name}: No favicon, generating logo fallback`);
        updates.logo = generateLogoBase64(repo.name);
        needsUpdate = true;
      }
      
      // Check if repository has old logo format (check if it's the new format)
      if (!repo.favicon && repo.logo && !repo.logo.includes('data:image/svg+xml;base64')) {
        console.log(`🔄 ${repo.name}: Updating old logo format`);
        updates.logo = generateLogoBase64(repo.name);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await prisma.repository.update({
          where: { id: repo.id },
          data: updates
        });
        updatedCount++;
        console.log(`✅ Updated ${repo.name}`);
      } else {
        console.log(`✅ ${repo.name}: Already up to date`);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Updated ${updatedCount} repositories`);
    console.log(`📊 ${repos.length - updatedCount} repositories were already up to date`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateProductionRepos();
