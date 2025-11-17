const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to generate improved logo (same as in extract-metadata route)
function generateLogoBase64(text) {
  const words = text.split(' ').slice(0, 2).filter(word => word.length > 0);
  const logoText = words.map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="white" stroke="#e5e7eb" stroke-width="1"/>
      <text x="12" y="16" font-family="Arial, sans-serif" font-size="8" font-weight="600" 
            text-anchor="middle" fill="#374151" letter-spacing="-0.3px">${logoText}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function runProductionMigration() {
  try {
    console.log('🚀 Running production migration for repository icons...');
    
    // First check if logo column exists
    try {
      await prisma.repository.findFirst({
        select: {
          logo: true
        }
      });
    } catch (error) {
      if (error.code === 'P2022' && error.meta?.column === 'Repository.logo') {
        console.log('⚠️ Logo column does not exist yet. Skipping icon migration.');
        console.log('💡 The logo column will be added by the pending migration.');
        return;
      }
      throw error;
    }
    
    // Get all repositories without proper logo fallbacks
    const repos = await prisma.repository.findMany({
      where: {
        OR: [
          { logo: null },
          { 
            AND: [
              { favicon: null },
              { logo: { not: { contains: 'data:image/svg+xml;base64' } } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        favicon: true,
        logo: true
      }
    });
    
    if (repos.length === 0) {
      console.log('✅ All repositories already have proper icons');
      return;
    }
    
    console.log(`📊 Found ${repos.length} repositories that need icon updates`);
    
    let updatedCount = 0;
    
    for (const repo of repos) {
      // Only update if no favicon and no proper logo
      if (!repo.favicon && (!repo.logo || !repo.logo.includes('data:image/svg+xml;base64'))) {
        await prisma.repository.update({
          where: { id: repo.id },
          data: {
            logo: generateLogoBase64(repo.name)
          }
        });
        updatedCount++;
        console.log(`✅ Updated ${repo.name} with improved logo`);
      }
    }
    
    console.log(`🎉 Migration completed! Updated ${updatedCount} repositories`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Don't fail the build if migration fails
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if this is a production build
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  runProductionMigration();
} else {
  console.log('⏭️ Skipping production migration (not in production environment)');
}
