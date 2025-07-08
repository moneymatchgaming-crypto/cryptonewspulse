const axios = require('axios')

const API_BASE_URL = 'http://localhost:3001'

async function testPerformance() {
  console.log('🚀 Testing CryptoNewsPulse Performance...\n')
  
  const tests = [
    {
      name: 'Fast News Loading',
      endpoint: '/api/news/fast?limit=12',
      description: 'Initial page load with priority feeds only'
    },
    {
      name: 'Bitcoin Dominance',
      endpoint: '/api/bitcoin-dominance',
      description: 'Market dominance data'
    },
    {
      name: 'Fear & Greed Index',
      endpoint: '/api/fear-greed',
      description: 'Market sentiment data'
    },
    {
      name: 'Full News (Page 1)',
      endpoint: '/api/news?page=1&limit=12',
      description: 'Full news with pagination'
    }
  ]
  
  for (const test of tests) {
    console.log(`📊 Testing: ${test.name}`)
    console.log(`   Description: ${test.description}`)
    
    const startTime = Date.now()
    
    try {
      const response = await axios.get(`${API_BASE_URL}${test.endpoint}`, {
        timeout: 15000
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log(`   ✅ Success: ${duration}ms`)
      
      if (test.name === 'Fast News Loading') {
        console.log(`   📰 Articles: ${response.data.articles?.length || 0}`)
        console.log(`   💾 Cached: ${response.data.cached || false}`)
        if (response.data.cacheAge) {
          console.log(`   ⏰ Cache Age: ${Math.round(response.data.cacheAge / 1000)}s`)
        }
      } else if (test.name === 'Bitcoin Dominance') {
        console.log(`   📊 Dominance: ${response.data.dominance?.toFixed(2) || 0}%`)
        console.log(`   💾 Cached: ${response.data.cached || false}`)
      } else if (test.name === 'Fear & Greed Index') {
        console.log(`   😨 Value: ${response.data.fearGreed?.value || 0} (${response.data.fearGreed?.classification || 'Unknown'})`)
        console.log(`   💾 Cached: ${response.data.cached || false}`)
      } else if (test.name === 'Full News (Page 1)') {
        console.log(`   📰 Articles: ${response.data.articles?.length || 0}`)
        console.log(`   📄 Page: ${response.data.page || 1}/${response.data.totalPages || 1}`)
        console.log(`   💾 Cached: ${response.data.cached || false}`)
      }
      
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log(`   ❌ Failed: ${duration}ms - ${error.message}`)
    }
    
    console.log('')
  }
  
  console.log('🎯 Performance Test Complete!')
  console.log('\n💡 Tips for faster loading:')
  console.log('   • Use the fast news endpoint for initial page load')
  console.log('   • The server caches data for 5 minutes')
  console.log('   • Bitcoin dominance has fallback APIs')
  console.log('   • Priority feeds load much faster than full feeds')
}

// Run the test
testPerformance().catch(console.error) 