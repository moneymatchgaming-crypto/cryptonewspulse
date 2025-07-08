const axios = require('axios')

// Common DailyCoin RSS feed URLs to test
const DAILYCOIN_URLS = [
  'https://dailycoin.com/rss',
  'https://dailycoin.com/feed',
  'https://dailycoin.com/rss.xml',
  'https://dailycoin.com/feed.xml',
  'https://dailycoin.com/feed/',
  'https://dailycoin.com/rss/',
  'https://dailycoin.com/news/rss',
  'https://dailycoin.com/news/feed',
  'https://dailycoin.com/articles/rss',
  'https://dailycoin.com/articles/feed'
]

async function testFeed(url) {
  try {
    console.log(`Testing: ${url}`)
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (response.status === 200) {
      console.log(`✅ SUCCESS: ${url} (${response.data.length} chars)`)
      return { success: true, url, length: response.data.length }
    } else {
      console.log(`❌ FAILED: ${url} - HTTP ${response.status}`)
      return { success: false, url, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    console.log(`❌ FAILED: ${url} - ${error.message}`)
    return { success: false, url, error: error.message }
  }
}

async function testAllDailyCoinFeeds() {
  console.log('🔍 Testing DailyCoin RSS feed URLs...\n')
  
  const results = []
  for (const url of DAILYCOIN_URLS) {
    const result = await testFeed(url)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const working = results.filter(r => r.success)
  
  console.log('\n📊 RESULTS:')
  console.log(`✅ Working: ${working.length}`)
  console.log(`❌ Failed: ${results.length - working.length}`)
  
  if (working.length > 0) {
    console.log('\n🎯 WORKING DAILYCOIN FEEDS:')
    working.forEach(r => {
      console.log(`  ${r.url} (${r.length} chars)`)
    })
  } else {
    console.log('\n⚠️  No working DailyCoin feeds found')
  }
}

testAllDailyCoinFeeds().catch(console.error) 