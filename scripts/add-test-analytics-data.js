const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestAnalyticsData() {
  try {
    console.log('🧪 Adding test analytics data...');

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

    // Add some test project clicks
    await prisma.projectClick.createMany({
      data: [
        {
          portfolioId,
          projectId: 1,
          projectName: 'E-commerce Website',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com'
        },
        {
          portfolioId,
          projectId: 1,
          projectName: 'E-commerce Website',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://github.com'
        },
        {
          portfolioId,
          projectId: 2,
          projectName: 'Task Management App',
          ipAddress: '192.168.1.3',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://linkedin.com'
        },
        {
          portfolioId,
          projectId: 2,
          projectName: 'Task Management App',
          ipAddress: '192.168.1.4',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://twitter.com'
        },
        {
          portfolioId,
          projectId: 2,
          projectName: 'Task Management App',
          ipAddress: '192.168.1.5',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://github.com'
        }
      ]
    });

    // Add some test social clicks
    await prisma.socialClick.createMany({
      data: [
        {
          portfolioId,
          socialType: 'github',
          socialUrl: 'https://github.com/user',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com'
        },
        {
          portfolioId,
          socialType: 'github',
          socialUrl: 'https://github.com/user',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://linkedin.com'
        },
        {
          portfolioId,
          socialType: 'linkedin',
          socialUrl: 'https://linkedin.com/in/user',
          ipAddress: '192.168.1.3',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://github.com'
        },
        {
          portfolioId,
          socialType: 'twitter',
          socialUrl: 'https://twitter.com/user',
          ipAddress: '192.168.1.4',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com'
        }
      ]
    });

    // Add some test sessions
    await prisma.portfolioSession.createMany({
      data: [
        {
          portfolioId,
          sessionId: 'session-1',
          startTime: new Date(Date.now() - 3600000), // 1 hour ago
          endTime: new Date(Date.now() - 3000000), // 50 minutes ago
          timeSpent: 600, // 10 minutes
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com'
        },
        {
          portfolioId,
          sessionId: 'session-2',
          startTime: new Date(Date.now() - 1800000), // 30 minutes ago
          endTime: new Date(Date.now() - 1200000), // 20 minutes ago
          timeSpent: 600, // 10 minutes
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://linkedin.com'
        },
        {
          portfolioId,
          sessionId: 'session-3',
          startTime: new Date(Date.now() - 900000), // 15 minutes ago
          endTime: new Date(Date.now() - 300000), // 5 minutes ago
          timeSpent: 600, // 10 minutes
          ipAddress: '192.168.1.3',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://github.com'
        }
      ]
    });

    console.log('✅ Test analytics data added successfully!');
    console.log('📊 Project clicks: 5');
    console.log('📊 Social clicks: 4');
    console.log('📊 Sessions: 3');

  } catch (error) {
    console.error('❌ Error adding test analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestAnalyticsData();
