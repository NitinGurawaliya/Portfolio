// Migration script to add logos to existing repositories
// This script generates logos for existing repositories that don't have favicons

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to generate a branded logo from text (same as in the API)
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

async function migrateExistingRepos() {
  try {
    console.log('🔄 Starting migration for existing repositories...');
    
    // Find repositories that don't have favicon or logo
    const repositoriesToUpdate = await prisma.repository.findMany({
      where: {
        OR: [
          { favicon: null },
          { logo: null }
        ]
      },
      select: {
        id: true,
        name: true,
        favicon: true,
        logo: true
      }
    });

    console.log(`📊 Found ${repositoriesToUpdate.length} repositories to update`);

    let updatedCount = 0;

    for (const repo of repositoriesToUpdate) {
      try {
        // Generate logo for repositories that don't have favicon or logo
        const shouldGenerateLogo = !repo.favicon && !repo.logo;
        
        if (shouldGenerateLogo) {
          const logoBase64 = generateLogoBase64(repo.name);
          
          await prisma.repository.update({
            where: { id: repo.id },
            data: {
              logo: logoBase64
            }
          });
          
          updatedCount++;
          console.log(`✅ Updated repository: ${repo.name}`);
        }
      } catch (error) {
        console.error(`❌ Error updating repository ${repo.name}:`, error);
      }
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} repositories with logos.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateExistingRepos();
