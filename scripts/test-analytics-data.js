const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAnalyticsData() {
  try {
    console.log('🧪 Testing analytics data generation...');
    
    // Get a portfolio ID
    const portfolio = await prisma.portfolio.findFirst({
      select: { id: true }
    });
    
    if (!portfolio) {
      console.log('❌ No portfolio found');
      return;
    }
    
    console.log(`📊 Testing with portfolio ID: ${portfolio.id}`);
    
    // Generate test data like the API does (with 3 days advance)
    const today = new Date();
    const advanceDays = 3;
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + advanceDays);
    
    console.log(`📅 Today: ${today.toISOString().split('T')[0]}`);
    console.log(`📅 End date (with ${advanceDays} days advance): ${endDate.toISOString().split('T')[0]}`);
    
    const dailyData = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i + advanceDays); // Add advance days
      const dateStr = date.toISOString().split('T')[0];
      dailyData.push({
        date: dateStr,
        count: Math.floor(Math.random() * 5) // Random test data
      });
    }
    
    console.log(`📊 Generated ${dailyData.length} days of data`);
    console.log(`📅 First day: ${dailyData[0]?.date}`);
    console.log(`📅 Last day: ${dailyData[dailyData.length - 1]?.date}`);
    
    // Test week generation
    const weeks = [];
    for (let i = 0; i < 52; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j;
        if (dayIndex < dailyData.length) {
          week.push(dailyData[dayIndex]);
        } else {
          week.push({ date: '', count: 0 });
        }
      }
      weeks.push(week);
    }
    
    console.log(`📊 Generated ${weeks.length} weeks`);
    console.log(`📊 Total boxes: ${weeks.length * 7}`);
    
    // Check last few weeks
    console.log('\n📅 Last 3 weeks:');
    for (let i = weeks.length - 3; i < weeks.length; i++) {
      const week = weeks[i];
      const weekDates = week.map(day => day.date ? day.date.split('-')[2] : 'empty');
      console.log(`Week ${i + 1}: ${weekDates.join(' ')}`);
    }
    
    console.log('\n✅ Analytics data generation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsData();
