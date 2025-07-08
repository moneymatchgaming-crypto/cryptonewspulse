const axios = require('axios')

// Specific alternatives for the 4 failed feeds
const ALTERNATIVES = {
  'cryptonews.com/news/feed': [
    'https://cryptonews.com/news/rss.xml',
    'https://cryptonews.com/feed/',
    'https://cryptonews.com/rss/',
    'https://cryptonews.com/news/feed.xml',
    'https://cryptonews.com/rss.xml'
  ],
  'bitcoinmagazine.com/.rss/full/': [
    'https://bitcoinmagazine.com/.rss/',
    'https://bitcoinmagazine.com/rss/',
    'https://bitcoinmagazine.com/feed/',
    'https://bitcoinmagazine.com/rss.xml',
    'https://bitcoinmagazine.com/feed.xml'
  ],
  'dailycoin.com/feed/': [
    'https://dailycoin.com/rss/',
    'https://dailycoin.com/feed.xml',
    'https://dailycoin.com/rss.xml',
    'https://dailycoin.com/feed/rss/',
    'https://dailycoin.com/rss/feed/'
  ],
  'dailyhodl.com/altcoins/feed': [
    'https://dailyhodl.com/altcoins/rss/',
    'https://dailyhodl.com/altcoins/feed.xml',
    'https://dailyhodl.com/altcoins/rss.xml',
    'https://dailyhodl.com/altcoins/feed/rss/',
    'https://dailyhodl.com/rss/altcoins/'
  ]
}

// Additional reliable crypto news sources as backups
const BACKUP_SOURCES = [
  'https://cointelegraph.com/rss',
  'https://coindesk.com/arc/outboundfeeds/rss/',
  'https://decrypt.co/feed',
  'https://www.theblock.co/rss.xml',
  'https://www.newsbtc.com/feed/',
  'https://ambcrypto.com/feed/',
  'https://cryptoslate.com/feed/',
  'https://u.today/rss',
  'https://beincrypto.com/feed/',
  'https://cryptobriefing.com/feed/',
  'https://blockonomi.com/feed/',
  'https://cryptopotato.com/feed/',
  'https://bitcoinist.com/feed/',
  'https://dailyhodl.com/feed/',
  'https://thedefiant.io/feed',
  'https://www.defirate.com/feed/',
  'https://blog.instadapp.io/rss/',
  'https://medium.com/feed/aave',
  'https://medium.com/feed/balancer-protocol',
  'https://medium.com/feed/sushiswap-org',
  'https://solana.com/news/rss.xml',
  'https://www.starkware.co/feed/',
  'https://www.btctimes.com/rss',
  'https://blog.bitmex.com/feed/',
  'https://altcoininvestor.com/latest/rss',
  'https://altcointradershandbook.com/feed/',
  'https://altcoinspekulant.com/feed/',
  'https://blog.coinpayments.net/tag/altcoin/feed',
  'https://fuk.io/tag/altcoin/feed',
  'https://tokeninsight.com/rss/news',
  'https://coingape.com/feed'
]

async function testFeed(url) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    if (response.status === 200) {
      return { success: true, url, status: response.status, length: response.data.length }
    } else {
      return { success: false, url, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { success: false, url, error: error.message }
  }
}

async function testAlternatives() {
  console.log('🔍 Testing specific alternatives for failed feeds...\n')
  
  // Test alternatives for each failed feed
  for (const [failedFeed, alternatives] of Object.entries(ALTERNATIVES)) {
    console.log(`\n📰 Testing alternatives for: ${failedFeed}`)
    console.log('=' .repeat(50))
    
    const results = []
    for (const alt of alternatives) {
      const result = await testFeed(alt)
      results.push(result)
      
      if (result.success) {
        console.log(`✅ ${alt} (${result.length} chars)`)
      } else {
        console.log(`❌ ${alt} - ${result.error}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    const working = results.filter(r => r.success)
    if (working.length > 0) {
      console.log(`\n🎯 RECOMMENDED REPLACEMENT: ${working[0].url}`)
    } else {
      console.log(`\n⚠️  No working alternatives found for ${failedFeed}`)
    }
  }
  
  // Test backup sources
  console.log('\n\n🔄 Testing backup sources...')
  console.log('=' .repeat(30))
  
  const backupResults = []
  for (const backup of BACKUP_SOURCES) {
    const result = await testFeed(backup)
    backupResults.push(result)
    
    if (result.success) {
      console.log(`✅ ${backup} (${result.length} chars)`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  const workingBackups = backupResults.filter(r => r.success)
  console.log(`\n📊 Backup sources: ${workingBackups.length}/${backupResults.length} working`)
}

testAlternatives().catch(console.error) 