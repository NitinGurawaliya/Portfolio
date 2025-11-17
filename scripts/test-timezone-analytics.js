const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTimezoneAnalytics() {
  try {
    console.log('🌍 Testing analytics with different timezone scenarios...');
    
    // Test different advance days
    const advanceDaysOptions = [3, 5, 7, 10];
    
    for (const advanceDays of advanceDaysOptions) {
      console.log(`\n📅 Testing with ${advanceDays} days advance:`);
      
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + advanceDays);
      
      console.log(`   Current time: ${now.toISOString()}`);
      console.log(`   End date: ${endDate.toISOString().split('T')[0]}`);
      
      // Generate data like the API
      const dailyData = [];
      for (let i = 364; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i + advanceDays);
        const dateStr = date.toISOString().split('T')[0];
        dailyData.push({
          date: dateStr,
          count: 0
        });
      }
      
      console.log(`   Generated ${dailyData.length} days`);
      console.log(`   First day: ${dailyData[0]?.date}`);
      console.log(`   Last day: ${dailyData[dailyData.length - 1]?.date}`);
      
      // Check if today is included
      const todayStr = now.toISOString().split('T')[0];
      const todayIncluded = dailyData.some(day => day.date === todayStr);
      console.log(`   Today (${todayStr}) included: ${todayIncluded ? '✅' : '❌'}`);
      
      // Check if tomorrow is included
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowIncluded = dailyData.some(day => day.date === tomorrowStr);
      console.log(`   Tomorrow (${tomorrowStr}) included: ${tomorrowIncluded ? '✅' : '❌'}`);
    }
    
    console.log('\n🎯 Recommendation: Use 7+ days advance for maximum safety');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTimezoneAnalytics();
