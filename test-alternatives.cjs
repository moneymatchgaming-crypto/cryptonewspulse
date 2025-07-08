const axios = require('axios')

// Alternative feeds to replace the failed ones
const ALTERNATIVE_FEEDS = [
  // Replace cryptonews.com/news/feed (403 error)
  'https://cryptonews.com/news/rss.xml',
  'https://cryptonews.com/feed/',
  'https://cryptonews.com/rss/',
  'https://cryptonews.com/news/feed.xml',
  
  // Replace bitcoinmagazine.com/.rss/full/ (403 error)
  'https://bitcoinmagazine.com/.rss/',
  'https://bitcoinmagazine.com/rss/',
  'https://bitcoinmagazine.com/feed/',
  'https://bitcoinmagazine.com/rss.xml',
  
  // Replace dailycoin.com/feed/ (timeout)
  'https://dailycoin.com/rss/',
  'https://dailycoin.com/feed.xml',
  'https://dailycoin.com/rss.xml',
  
  // Replace dailyhodl.com/altcoins/feed (timeout)
  'https://dailyhodl.com/altcoins/rss/',
  'https://dailyhodl.com/altcoins/feed.xml',
  'https://dailyhodl.com/altcoins/rss.xml',
  
  // Additional reliable crypto news sources
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
  'https://coingape.com/feed',
  
  // New alternative sources
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://www.cointelegraph.com/rss',
  'https://www.newsbtc.com/feed/',
  'https://www.ambcrypto.com/feed/',
  'https://www.cryptoslate.com/feed/',
  'https://www.u.today/rss',
  'https://www.beincrypto.com/feed/',
  'https://www.cryptobriefing.com/feed/',
  'https://www.blockonomi.com/feed/',
  'https://www.cryptopotato.com/feed/',
  'https://www.bitcoinist.com/feed/',
  'https://www.dailyhodl.com/feed/',
  'https://www.thedefiant.io/feed',
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

async function testFeed(url, index) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    if (response.status === 200) {
      return { success: true, url, index, status: response.status, length: response.data.length }
    } else {
      return { success: false, url, index, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { success: false, url, index, error: error.message }
  }
}

async function testAlternatives() {
  console.log(`🚀 Testing alternative RSS feeds...\n`)
  const results = []
  
  // Test each alternative feed
  for (let i = 0; i < ALTERNATIVE_FEEDS.length; i++) {
    const result = await testFeed(ALTERNATIVE_FEEDS[i], i)
    results.push(result)
    
    // Only log successful ones to avoid spam
    if (result.success) {
      console.log(`✅ ${result.index}: ${result.url} (${result.length} chars)`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 500)) // Faster testing
  }
  
  const working = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`\n📊 RESULTS: ${working.length} working, ${failed.length} failed`)
  
  // Show potential replacements for the failed feeds
  console.log('\n🔄 POTENTIAL REPLACEMENTS FOR FAILED FEEDS:')
  console.log('============================================')
  
  // Group by original failed feed
  const replacements = {
    'cryptonews.com': working.filter(r => r.url.includes('cryptonews')),
    'bitcoinmagazine.com': working.filter(r => r.url.includes('bitcoinmagazine')),
    'dailycoin.com': working.filter(r => r.url.includes('dailycoin')),
    'dailyhodl.com/altcoins': working.filter(r => r.url.includes('dailyhodl') && r.url.includes('altcoin'))
  }
  
  Object.entries(replacements).forEach(([original, alts]) => {
    if (alts.length > 0) {
      console.log(`\n${original}:`)
      alts.forEach(alt => {
        console.log(`  ✅ ${alt.url}`)
      })
    }
  })
}

testAlternatives().catch(console.error) 