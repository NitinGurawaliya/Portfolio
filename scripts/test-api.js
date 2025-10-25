const fetch = require('node-fetch')

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...')
    
    // Test 1: Get all daily views for portfolio 1
    console.log('\n1. Testing GET /api/analytics/track-project-click?portfolioId=1&days=7')
    const response1 = await fetch('http://localhost:3000/api/analytics/track-project-click?portfolioId=1&days=7')
    console.log('Status:', response1.status)
    if (response1.ok) {
      const data1 = await response1.json()
      console.log('Response:', JSON.stringify(data1, null, 2))
    } else {
      const error1 = await response1.text()
      console.log('Error:', error1)
    }
    
    // Test 2: Get specific project data
    console.log('\n2. Testing GET /api/analytics/track-project-click?portfolioId=1&projectId=1761252853503&days=7')
    const response2 = await fetch('http://localhost:3000/api/analytics/track-project-click?portfolioId=1&projectId=1761252853503&days=7')
    console.log('Status:', response2.status)
    if (response2.ok) {
      const data2 = await response2.json()
      console.log('Response:', JSON.stringify(data2, null, 2))
    } else {
      const error2 = await response2.text()
      console.log('Error:', error2)
    }
    
    // Test 3: Test project click tracking
    console.log('\n3. Testing POST /api/analytics/track-project-click')
    const response3 = await fetch('http://localhost:3000/api/analytics/track-project-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        portfolioId: 1,
        projectId: '1761252853503',
        projectName: 'Devfolio'
      })
    })
    console.log('Status:', response3.status)
    if (response3.ok) {
      const data3 = await response3.json()
      console.log('Response:', JSON.stringify(data3, null, 2))
    } else {
      const error3 = await response3.text()
      console.log('Error:', error3)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAPI()
