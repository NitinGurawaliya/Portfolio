const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSimpleAPI() {
  try {
    console.log('🔧 Creating simple API test data...')
    
    // Get all daily project views for portfolio 1
    const dailyViews = await prisma.dailyProjectViews.findMany({
      where: { portfolioId: 1 },
      orderBy: { date: 'asc' }
    })
    
    console.log(`📊 Found ${dailyViews.length} daily views`)
    
    // Group by project
    const projectData = {}
    dailyViews.forEach(view => {
      if (!projectData[view.projectName]) {
        projectData[view.projectName] = []
      }
      projectData[view.projectName].push({
        date: view.date.toISOString().split('T')[0],
        views: view.views
      })
    })
    
    console.log('📈 Project data:', Object.keys(projectData))
    
    // Create 7 days of data for each project
    const chartData = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dateKey = date.toISOString().split('T')[0]
      
      const dayData = {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateKey
      }
      
      // Add data for each project
      Object.keys(projectData).forEach(projectName => {
        const projectViews = projectData[projectName].find(p => p.date === dateKey)
        dayData[projectName] = projectViews ? projectViews.views : 0
      })
      
      chartData.push(dayData)
    }
    
    console.log('📊 Chart data created:', chartData.length, 'days')
    console.log('Sample day:', chartData[0])
    
    // Save to file for testing
    const fs = require('fs')
    fs.writeFileSync('test-api-response.json', JSON.stringify({
      success: true,
      data: chartData,
      totalViews: dailyViews.reduce((sum, view) => sum + view.views, 0)
    }, null, 2))
    
    console.log('✅ Test API response saved to test-api-response.json')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSimpleAPI()
