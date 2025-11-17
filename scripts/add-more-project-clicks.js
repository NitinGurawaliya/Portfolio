const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMoreProjectClicks() {
  try {
    console.log('🧪 Adding more project clicks...');

    // Get first portfolio ID
    const portfolio = await prisma.portfolio.findFirst({
      select: { id: true }
    });

    if (!portfolio) {
      console.log('❌ No portfolio found');
      return;
    }

    const portfolioId = portfolio.id;
    console.log(`📊 Using portfolio ID: ${portfolioId}`);

    // Add more test project clicks for different projects
    await prisma.projectClick.createMany({
      data: [
        {
          portfolioId,
          projectId: 3,
          projectName: 'React Dashboard',
          ipAddress: '192.168.1.6',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com'
        },
        {
          portfolioId,
          projectId: 3,
          projectName: 'React Dashboard',
          ipAddress: '192.168.1.7',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://linkedin.com'
        },
        {
          portfolioId,
          projectId: 4,
          projectName: 'Node.js API',
          ipAddress: '192.168.1.8',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://github.com'
        },
        {
          portfolioId,
          projectId: 4,
          projectName: 'Node.js API',
          ipAddress: '192.168.1.9',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://twitter.com'
        },
        {
          portfolioId,
          projectId: 4,
          projectName: 'Node.js API',
          ipAddress: '192.168.1.10',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com'
        },
        {
          portfolioId,
          projectId: 5,
          projectName: 'Mobile App',
          ipAddress: '192.168.1.11',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://linkedin.com'
        }
      ]
    });

    console.log('✅ More project clicks added successfully!');

  } catch (error) {
    console.error('❌ Error adding more project clicks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreProjectClicks();
