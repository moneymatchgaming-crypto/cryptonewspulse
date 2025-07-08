const axios = require('axios')

// All feeds from the server (both priority and additional)
const RSS_FEEDS = [
  // Priority feeds
  'https://cointelegraph.com/rss',
  'https://coindesk.com/arc/outboundfeeds/rss/',
  'https://cryptonews.com/news/feed',
  'https://bitcoinmagazine.com/.rss/full/',
  'https://decrypt.co/feed',
  'https://www.theblock.co/rss.xml',
  'https://www.newsbtc.com/feed/',
  'https://ambcrypto.com/feed/',
  'https://cryptoslate.com/feed/',
  'https://u.today/rss',
  'https://beincrypto.com/feed/',
  'https://cryptobriefing.com/feed/',
  
  // Additional feeds
  'https://dailycoin.com/feed/',
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
  'https://dailyhodl.com/altcoins/feed',
  'https://altcoininvestor.com/latest/rss',
  'https://altcointradershandbook.com/feed',
  'https://altcoinspekulant.com/feed',
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

async function testAllFeeds() {
  console.log(`🚀 Testing all ${RSS_FEEDS.length} RSS feeds...\n`)
  const results = []
  for (let i = 0; i < RSS_FEEDS.length; i++) {
    const result = await testFeed(RSS_FEEDS[i], i)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  const working = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log('\n✅ WORKING FEEDS:')
  if (working.length > 0) {
    working.forEach(r => {
      console.log(`  ${r.index}: ${r.url} (Status: ${r.status}, Length: ${r.length})`)
    })
  } else {
    console.log('  None')
  }

  console.log('\n❌ FAILED FEEDS:')
  if (failed.length > 0) {
    failed.forEach(r => {
      console.log(`  ${r.index}: ${r.url} - ${r.error}`)
    })
  } else {
    console.log('  None')
  }

  console.log(`\nSUMMARY: ${working.length} working, ${failed.length} failed, ${results.length} total feeds.`)
}

testAllFeeds().catch(console.error) 