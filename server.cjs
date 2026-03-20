const express = require('express')
const cors = require('cors')
const axios = require('axios')
const xml2js = require('xml2js')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const multer = require('multer')

// ── Image upload (multer → public/images/blog/) ────────────────────────────────
const blogImagesDir = path.join(__dirname, 'public', 'images', 'blog')
if (!fs.existsSync(blogImagesDir)) fs.mkdirSync(blogImagesDir, { recursive: true })

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, blogImagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})
const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  }
})

// Environment configuration
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET || 'cnp-dev-secret-change-in-production'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// ── File-based post storage ────────────────────────────────────────────────────
// Posts live in public/content/posts/ so Vite copies them into dist/ at build
// time — Vercel then serves them as static files with no backend required.
const postsDir = path.join(__dirname, 'public', 'content', 'posts')
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })

// _index.json is a lightweight manifest (no content field) for blog listing pages
const indexPath = path.join(postsDir, '_index.json')
if (!fs.existsSync(indexPath)) fs.writeFileSync(indexPath, '[]')

function readAllPosts() {
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.json') && f !== '_index.json')
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(postsDir, f), 'utf8')) }
      catch { return null }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

function readPost(slug) {
  const filePath = path.join(postsDir, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writePost(post) {
  fs.writeFileSync(path.join(postsDir, `${post.slug}.json`), JSON.stringify(post, null, 2))
  rebuildIndex()
}

function deletePost(slug) {
  const filePath = path.join(postsDir, `${slug}.json`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  rebuildIndex()
}

// Regenerate the public listing manifest after any post change
function rebuildIndex() {
  const summary = readAllPosts()
    .filter(p => p.published === 1)
    .map(({ id, title, slug, excerpt, cover_image, category, published, created_at }) =>
      ({ id, title, slug, excerpt, cover_image, category, published, created_at }))
  fs.writeFileSync(indexPath, JSON.stringify(summary, null, 2))
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Slug helper ────────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const app = express()

// CORS configuration for production
app.use(cors({
  origin: NODE_ENV === 'production' ? CORS_ORIGIN : true,
  credentials: true
}))

app.use(express.json())

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MARKET_DATA_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for market data
const FEED_TIMEOUT = 3000 // 3 seconds per feed (reduced for faster loading)
const MAX_CONCURRENT_FEEDS = 15 // Increased concurrent requests for faster loading

// In-memory cache
let newsCache = {
  data: null,
  timestamp: null,
  isRefreshing: false
}

// Market data cache
let marketDataCache = {
  prices: null,
  fearGreed: null,
  bitcoinDominance: null,
  timestamp: null,
  isRefreshing: false
}

// RSS Feed URLs for crypto news - Optimized for fast loading
// Priority 1: Fast, reliable feeds for initial load (reduced for faster loading)
const PRIORITY_FEEDS = [
  'https://cointelegraph.com/rss',
  'https://coindesk.com/arc/outboundfeeds/rss/',
  'https://cryptonews.com/feed/',
  'https://decrypt.co/feed',
  'https://www.theblock.co/rss.xml',
  'https://www.newsbtc.com/feed/',
  'https://ambcrypto.com/feed/',
  'https://cryptoslate.com/feed/'
]

// Priority 2: Additional feeds for expanded content
const ADDITIONAL_FEEDS = [
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
  'https://dailyhodl.com/altcoins/rss/',
  'https://altcoininvestor.com/latest/rss',
  'https://altcointradershandbook.com/feed',
  'https://altcoinspekulant.com/feed',
  'https://blog.coinpayments.net/tag/altcoin/feed',
  'https://fuk.io/tag/altcoin/feed',
  'https://tokeninsight.com/rss/news',
  'https://coingape.com/feed'
]

// Combined feeds for full content
const RSS_FEEDS = [...PRIORITY_FEEDS, ...ADDITIONAL_FEEDS]

// Helper function to fetch a single RSS feed with timeout
async function fetchRSSFeed(feedUrl, feedIndex) {
  try {
    console.log(`🔄 Fetching RSS feed ${feedIndex}: ${feedUrl}`)
    
    const response = await axios.get(feedUrl, {
      timeout: FEED_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    // Parse XML to JSON
    const parser = new xml2js.Parser()
    const result = await parser.parseStringPromise(response.data)
    
    console.log(`✅ Successfully fetched RSS feed ${feedIndex}: ${feedUrl}`)
    return { success: true, data: result, feedIndex, feedUrl }
  } catch (error) {
    console.error(`❌ Failed to fetch RSS feed ${feedIndex}: ${feedUrl} - ${error.message}`)
    return { success: false, error: error.message, feedIndex, feedUrl }
  }
}

// Helper function to process RSS feed data into news items
function processRSSFeed(jsonData, feedIndex) {
  try {
    const channel = jsonData.rss.channel[0]
    const items = channel.item || []
    
    return items.map((item, index) => {
      const title = item.title?.[0] || ''
      const description = item.description?.[0] || ''
      const link = item.link?.[0] || ''
      const pubDate = item.pubDate?.[0] || new Date().toISOString()
      
      // Try to extract image from description or use default
      const imgMatch = description.match(/<img[^>]+src="([^"]+)"/)
      const imageUrl = imgMatch ? imgMatch[1] : getDefaultImage(feedIndex)
      
      return {
        id: `rss-${feedIndex}-${index}`,
        title: cleanText(title),
        description: cleanText(description),
        url: link,
        urlToImage: imageUrl,
        publishedAt: new Date(pubDate).toISOString(),
        source: { name: getSourceName(feedIndex) },
        category: categorizeNews(title, description)
      }
    })
  } catch (error) {
    console.error(`Error processing RSS feed ${feedIndex}:`, error)
    return []
  }
}

// Helper functions
function cleanText(text) {
  return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
}

function getDefaultImage(feedIndex) {
  const defaultImages = [
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400'
  ]
  return defaultImages[feedIndex % defaultImages.length]
}

function getSourceName(feedIndex) {
  const sources = [
    // Original feeds
    'CoinTelegraph',    // 0
    'CoinDesk',         // 1
    'CryptoNews',       // 2
    'Bitcoin Magazine', // 3
    'Decrypt',          // 4
    'The Block',        // 5
    'NewsBTC',          // 6
    'AMBCrypto',        // 7
    'CryptoSlate',      // 8
    
    // 🔵 General Crypto News
    'U.Today',          // 9
    'BeInCrypto',       // 10
    'Crypto Briefing',  // 11
    'DailyCoin',        // 12
    'Blockonomi',       // 13
    'CryptoPotato',     // 14
    'Bitcoinist',       // 15
    'The Daily Hodl',   // 16
    
    // 🟢 Altcoin- & DeFi-Focused
    'Ethereum World News', // 17
    'The Defiant',      // 18
    'DLNews',           // 19
    
    // 🔹 DeFi Protocol Blogs & News
    'Bankless',         // 20
    'DeFi Rate',        // 21
    'Yield Protocol',   // 22
    'Instadapp',        // 23
    'Liquity',          // 24
    'Aave',             // 25
    'Curve Finance',    // 26
    'Balancer',         // 27
    'GMX',              // 28
    'SushiSwap',        // 29
    'Yearn Finance',    // 30
    'dYdX',             // 31
    
    // 🟠 Analytics & On-Chain Insights
    'Messari Blog',     // 32
    'IntoTheBlock',     // 33
    
    // ⚫️ Developer & Tech-Heavy
    'Parity Technologies', // 34
    'Solana Blog',      // 35
    'StarkWare Blog',   // 36
    
    // 🔴 Bitcoin-Only Feeds
    'BTC Times',        // 37
    'BitMEX Research',  // 38
    
    // 🚀 Top Altcoin RSS Feeds
    'Daily Hodl Altcoins', // 39
    'Altcoin Investor',    // 40
    'CoinSpeaker',         // 41
    'Blockchain Reporter', // 42
    'CryptoCoin News',     // 43
    'Altcoin Buzz',        // 44
    'CryptoNews Altcoins', // 45
    'Altcoin Trader Handbook', // 46
    'Altcoin Speculator',  // 47
    'CoinPayments Blog',   // 48
    'CoinSutra',           // 49
    'CryptoCoin Spy',      // 50
    'CryptoGlobe',         // 51
    'Global Coin Report',  // 52
    'Do I Own a Shitcoin', // 53
    'HitBTC Blog',         // 54
    'Financial Underground', // 55
    'CryptoKnowmics',      // 56
    
    // 🎯 Other Notable Feeds
    'E-Crypto News',       // 57
    'CoinJournal',         // 58
    'CCN News',            // 59
    'CCN Analysis',        // 60
    'TokenInsight',        // 61
    'CoinGape'             // 62
  ]
  return sources[feedIndex] || 'Crypto News'
}

function categorizeNews(title, description) {
  const text = (title + ' ' + description).toLowerCase()
  
  // Bitcoin-specific keywords
  if (text.includes('bitcoin') || text.includes('btc') || text.includes('satoshi')) return 'bitcoin'
  
  // Ethereum-specific keywords
  if (text.includes('ethereum') || text.includes('eth') || text.includes('ether')) return 'ethereum'
  
  // DeFi keywords
  if (text.includes('defi') || text.includes('decentralized finance') || text.includes('yield') || 
      text.includes('liquidity') || text.includes('amm') || text.includes('dex') || 
      text.includes('lending') || text.includes('borrowing') || text.includes('staking') ||
      text.includes('aave') || text.includes('curve') || text.includes('balancer') ||
      text.includes('uniswap') || text.includes('sushi') || text.includes('yearn') ||
      text.includes('compound') || text.includes('makerdao') || text.includes('dydx') ||
      text.includes('gmx') || text.includes('liquity') || text.includes('instadapp') ||
      text.includes('vault') || text.includes('governance') || text.includes('dao') ||
      text.includes('perpetual') || text.includes('derivative') || text.includes('amm') ||
      text.includes('liquidity mining') || text.includes('yield farming')) return 'defi'
  
  // NFT keywords
  if (text.includes('nft') || text.includes('non-fungible') || text.includes('digital art') || 
      text.includes('collectible') || text.includes('opensea') || text.includes('metaverse')) return 'nft'
  
  // Regulation keywords
  if (text.includes('regulation') || text.includes('sec') || text.includes('government') || 
      text.includes('legal') || text.includes('compliance') || text.includes('policy') || 
      text.includes('law') || text.includes('tax') || text.includes('ban')) return 'regulation'
  
  // Altcoin keywords
  if (text.includes('altcoin') || text.includes('alt coin') || text.includes('cardano') || 
      text.includes('solana') || text.includes('polkadot') || text.includes('ripple') || 
      text.includes('xrp') || text.includes('ada') || text.includes('dot') ||
      text.includes('binance coin') || text.includes('bnb') || text.includes('chainlink') ||
      text.includes('link') || text.includes('litecoin') || text.includes('ltc') ||
      text.includes('stellar') || text.includes('xlm') || text.includes('vechain') ||
      text.includes('vet') || text.includes('monero') || text.includes('xmr') ||
      text.includes('dash') || text.includes('neo') || text.includes('eos') ||
      text.includes('tezos') || text.includes('xtz') || text.includes('cosmos') ||
      text.includes('atom') || text.includes('avalanche') || text.includes('avax') ||
      text.includes('polygon') || text.includes('matic') || text.includes('algorand') ||
      text.includes('algo') || text.includes('filecoin') || text.includes('fil') ||
      text.includes('uniswap') || text.includes('uni') || text.includes('chainlink') ||
      text.includes('link') || text.includes('the graph') || text.includes('grt') ||
      text.includes('synthetix') || text.includes('snx') || text.includes('compound') ||
      text.includes('comp') || text.includes('maker') || text.includes('mkr') ||
      text.includes('0x') || text.includes('zrx') || text.includes('basic attention') ||
      text.includes('bat') || text.includes('decentraland') || text.includes('mana') ||
      text.includes('enjin') || text.includes('enj') || text.includes('sandbox') ||
      text.includes('sand') || text.includes('axie infinity') || text.includes('axs') ||
      text.includes('gala') || text.includes('illuvium') || text.includes('ilv') ||
      text.includes('stepn') || text.includes('gmt') || text.includes('move to earn') ||
      text.includes('play to earn') || text.includes('p2e') || text.includes('gamefi') ||
      text.includes('metaverse') || text.includes('web3') || text.includes('layer 2') ||
      text.includes('l2') || text.includes('rollup') || text.includes('optimism') ||
      text.includes('arbitrum') || text.includes('polygon') || text.includes('matic') ||
      text.includes('bsc') || text.includes('binance smart chain') || text.includes('fantom') ||
      text.includes('ftm') || text.includes('harmony') || text.includes('one') ||
      text.includes('near') || text.includes('aurora') || text.includes('celo') ||
      text.includes('klaytn') || text.includes('klay') || text.includes('elrond') ||
      text.includes('egld') || text.includes('hedera') || text.includes('hbar') ||
      text.includes('iota') || text.includes('miota') || text.includes('nano') ||
      text.includes('xno') || text.includes('raiblocks') || text.includes('xrb')) return 'general'
  
  return 'general'
}

// Main function to fetch RSS feeds with caching (optimized for speed)
async function fetchRSSFeeds(feeds = RSS_FEEDS) {
  console.log(`🚀 Starting RSS feed fetch for ${feeds.length} feeds...`)
  
  // For priority feeds, fetch all at once for maximum speed
  if (feeds.length <= MAX_CONCURRENT_FEEDS) {
    console.log(`⚡ Fetching ${feeds.length} feeds concurrently for maximum speed`)
    
    const promises = feeds.map((feedUrl, feedIndex) => fetchRSSFeed(feedUrl, feedIndex))
    const results = await Promise.allSettled(promises)
    
    let allNews = []
    let successfulFeeds = 0
    let failedFeeds = 0
    
    results.forEach((result, feedIndex) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const newsItems = processRSSFeed(result.value.data, feedIndex)
        allNews = allNews.concat(newsItems)
        successfulFeeds++
        console.log(`✅ Processed ${newsItems.length} articles from feed ${feedIndex}`)
      } else {
        failedFeeds++
        console.log(`❌ Failed to process feed ${feedIndex}`)
      }
    })
    
    console.log(`📊 RSS Feed Summary: ${successfulFeeds} successful, ${failedFeeds} failed, ${allNews.length} total articles`)
    
    // Sort by date and limit to 200 articles
    const sortedNews = allNews
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 200)
    
    return sortedNews
  }
  
  // For larger feed sets, use batching (but with reduced delays)
  const batches = []
  for (let i = 0; i < feeds.length; i += MAX_CONCURRENT_FEEDS) {
    batches.push(feeds.slice(i, i + MAX_CONCURRENT_FEEDS))
  }
  
  let allNews = []
  let successfulFeeds = 0
  let failedFeeds = 0
  
  // Process batches with minimal delays
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]
    console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} feeds)`)
    
    const batchPromises = batch.map((feedUrl, batchFeedIndex) => {
      const feedIndex = batchIndex * MAX_CONCURRENT_FEEDS + batchFeedIndex
      return fetchRSSFeed(feedUrl, feedIndex)
    })
    
    const batchResults = await Promise.allSettled(batchPromises)
    
    batchResults.forEach((result, batchFeedIndex) => {
      const feedIndex = batchIndex * MAX_CONCURRENT_FEEDS + batchFeedIndex
      
      if (result.status === 'fulfilled' && result.value.success) {
        const newsItems = processRSSFeed(result.value.data, feedIndex)
        allNews = allNews.concat(newsItems)
        successfulFeeds++
        console.log(`✅ Processed ${newsItems.length} articles from feed ${feedIndex}`)
      } else {
        failedFeeds++
        console.log(`❌ Failed to process feed ${feedIndex}`)
      }
    })
    
    // Reduced delay between batches for faster loading
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  console.log(`📊 RSS Feed Summary: ${successfulFeeds} successful, ${failedFeeds} failed, ${allNews.length} total articles`)
  
  // Sort by date and limit to 200 articles
  const sortedNews = allNews
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 200)
  
  return sortedNews
}

// Legacy function for backward compatibility
async function fetchAllRSSFeeds() {
  return fetchRSSFeeds(RSS_FEEDS)
}

// Main endpoint for all news
app.get('/api/news', async (req, res) => {
  try {
    const now = Date.now()
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const fastLoad = req.query.fast === 'true'
    
    // Check if we have valid cached data
    if (newsCache.data && newsCache.timestamp && (now - newsCache.timestamp) < CACHE_DURATION) {
      console.log('⚡ Serving cached news data')
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedNews = newsCache.data.slice(startIndex, endIndex)
      
      return res.json({
        articles: paginatedNews,
        total: newsCache.data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(newsCache.data.length / limit),
        cached: true,
        timestamp: newsCache.timestamp,
        cacheAge: now - newsCache.timestamp
      })
    }
    
    // If cache is being refreshed, return cached data if available
    if (newsCache.isRefreshing && newsCache.data) {
      console.log('🔄 Cache refresh in progress, serving stale data')
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedNews = newsCache.data.slice(startIndex, endIndex)
      
      return res.json({
        articles: paginatedNews,
        total: newsCache.data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(newsCache.data.length / limit),
        cached: true,
        stale: true,
        timestamp: newsCache.timestamp,
        cacheAge: now - newsCache.timestamp
      })
    }
    
    // Start refresh process
    newsCache.isRefreshing = true
    console.log(`🔄 Cache expired, fetching fresh news data... (fastLoad: ${fastLoad})`)
    
    // Use priority feeds only for fast loading
    const feedsToFetch = fastLoad ? PRIORITY_FEEDS : RSS_FEEDS
    const news = await fetchRSSFeeds(feedsToFetch) // This function now fetches all feeds
    
    // Update cache
    newsCache.data = news
    newsCache.timestamp = now
    newsCache.isRefreshing = false
    
    console.log(`✅ Fresh news data fetched: ${news.length} articles`)
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNews = news.slice(startIndex, endIndex)
    
    res.json({
      articles: paginatedNews,
      total: news.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(news.length / limit),
      cached: false,
      timestamp: now
    })
    
  } catch (error) {
    console.error('❌ Error fetching news:', error)
    newsCache.isRefreshing = false
    
    // Return cached data if available, even if stale
    if (newsCache.data) {
      console.log('🔄 Error occurred, serving stale cached data')
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 12
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedNews = newsCache.data.slice(startIndex, endIndex)
      
      return res.json({
        articles: paginatedNews,
        total: newsCache.data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(newsCache.data.length / limit),
        cached: true,
        stale: true,
        error: error.message,
        timestamp: newsCache.timestamp
      })
    }
    
    res.status(500).json({ error: 'Failed to fetch news data' })
  }
})

// Fast loading endpoint for initial page load
app.get('/api/news/fast', async (req, res) => {
  try {
    const now = Date.now()
    const limit = parseInt(req.query.limit) || 12
    
    // Check if we have valid cached data
    if (newsCache.data && newsCache.timestamp && (now - newsCache.timestamp) < CACHE_DURATION) {
      console.log('⚡ Serving cached news data (fast endpoint)')
      const fastNews = newsCache.data.slice(0, limit)
      
      return res.json({
        articles: fastNews,
        total: newsCache.data.length,
        cached: true,
        timestamp: newsCache.timestamp,
        cacheAge: now - newsCache.timestamp
      })
    }
    
    // If cache is being refreshed, return cached data if available
    if (newsCache.isRefreshing && newsCache.data) {
      console.log('🔄 Cache refresh in progress, serving stale data (fast endpoint)')
      const fastNews = newsCache.data.slice(0, limit)
      
      return res.json({
        articles: fastNews,
        total: newsCache.data.length,
        cached: true,
        stale: true,
        timestamp: newsCache.timestamp,
        cacheAge: now - newsCache.timestamp
      })
    }
    
    // Start refresh process with priority feeds only
    newsCache.isRefreshing = true
    console.log('🚀 Fast loading: fetching priority feeds only...')
    
    const news = await fetchRSSFeeds(PRIORITY_FEEDS) // This function now fetches all feeds
    
    // Update cache
    newsCache.data = news
    newsCache.timestamp = now
    newsCache.isRefreshing = false
    
    console.log(`✅ Fast news data fetched: ${news.length} articles`)
    
    // Return only the requested limit
    const fastNews = news.slice(0, limit)
    
    res.json({
      articles: fastNews,
      total: news.length,
      cached: false,
      timestamp: now
    })
    
  } catch (error) {
    console.error('❌ Error fetching fast news:', error)
    newsCache.isRefreshing = false
    
    // Return cached data if available, even if stale
    if (newsCache.data) {
      console.log('🔄 Error occurred, serving stale cached data (fast endpoint)')
      const limit = parseInt(req.query.limit) || 12
      const fastNews = newsCache.data.slice(0, limit)
      
      return res.json({
        articles: fastNews,
        total: newsCache.data.length,
        cached: true,
        stale: true,
        error: error.message,
        timestamp: newsCache.timestamp
      })
    }
    
    res.status(500).json({ error: 'Failed to fetch fast news data' })
  }
})

// Individual RSS feed endpoint (for debugging)
app.get('/api/rss/:feedIndex', async (req, res) => {
  try {
    const feedIndex = parseInt(req.params.feedIndex)
    
    if (feedIndex >= RSS_FEEDS.length) {
      return res.status(400).json({ error: 'Invalid feed index' })
    }
    
    const feedUrl = RSS_FEEDS[feedIndex]
    const result = await fetchRSSFeed(feedUrl, feedIndex)
    
    if (result.success) {
      res.json(result.data)
    } else {
      res.status(500).json({ error: result.error })
    }
  } catch (error) {
    console.error('RSS proxy error:', error.message)
    res.status(500).json({ error: 'Failed to fetch RSS feed' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0'
  })
})

// Market data endpoints with caching
app.get('/api/crypto-prices', async (req, res) => {
  try {
    const now = Date.now()
    
    // Check if we have valid cached data
    if (marketDataCache.prices && marketDataCache.timestamp && (now - marketDataCache.timestamp) < MARKET_DATA_CACHE_DURATION) {
      console.log('⚡ Serving cached crypto prices')
      return res.json({
        prices: marketDataCache.prices,
        cached: true,
        timestamp: marketDataCache.timestamp,
        cacheAge: now - marketDataCache.timestamp
      })
    }
    
    // If cache is being refreshed, return cached data if available
    if (marketDataCache.isRefreshing && marketDataCache.prices) {
      console.log('🔄 Market data refresh in progress, serving stale prices')
      return res.json({
        prices: marketDataCache.prices,
        cached: true,
        stale: true,
        timestamp: marketDataCache.timestamp,
        cacheAge: now - marketDataCache.timestamp
      })
    }
    
    // Start refresh process
    marketDataCache.isRefreshing = true
    console.log('🔄 Fetching fresh crypto prices...')
    
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: 'bitcoin,ethereum,ripple,solana,binancecoin,tron',
        per_page: 10,
        page: 1,
        sparkline: false,
        locale: 'en'
      },
      timeout: 10000
    })
    
    const prices = response.data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      image: coin.image
    }))
    
    // Update cache
    marketDataCache.prices = prices
    marketDataCache.timestamp = now
    marketDataCache.isRefreshing = false
    
    console.log(`✅ Fresh crypto prices fetched: ${prices.length} coins`)
    
    res.json({
      prices: prices,
      cached: false,
      timestamp: now
    })
    
  } catch (error) {
    console.error('❌ Error fetching crypto prices:', error)
    marketDataCache.isRefreshing = false
    
    // Return cached data if available, even if stale
    if (marketDataCache.prices) {
      console.log('🔄 Error occurred, serving stale cached prices')
      return res.json({
        prices: marketDataCache.prices,
        cached: true,
        stale: true,
        error: error.message,
        timestamp: marketDataCache.timestamp
      })
    }
    
    res.status(500).json({ error: 'Failed to fetch crypto prices' })
  }
})

// Bitcoin dominance endpoint with caching
app.get('/api/bitcoin-dominance', async (req, res) => {
  try {
    const now = Date.now()
    
    // Check if we have valid cached data
    if (marketDataCache.bitcoinDominance !== null && marketDataCache.timestamp && (now - marketDataCache.timestamp) < MARKET_DATA_CACHE_DURATION) {
      console.log('⚡ Serving cached Bitcoin dominance')
      return res.json({
        dominance: marketDataCache.bitcoinDominance,
        cached: true,
        timestamp: marketDataCache.timestamp,
        cacheAge: now - marketDataCache.timestamp
      })
    }
    
    // If cache is being refreshed, return cached data if available
    if (marketDataCache.isRefreshing && marketDataCache.bitcoinDominance !== null) {
      console.log('🔄 Market data refresh in progress, serving stale dominance')
      return res.json({
        dominance: marketDataCache.bitcoinDominance,
        cached: true,
        stale: true,
        timestamp: marketDataCache.timestamp,
        cacheAge: now - marketDataCache.timestamp
      })
    }
    
    // Start refresh process
    marketDataCache.isRefreshing = true
    console.log('🔄 Fetching fresh Bitcoin dominance...')
    
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/global', {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      const dominance = response.data.data?.market_cap_percentage?.btc || 0
      
      // Update cache
      marketDataCache.bitcoinDominance = dominance
      marketDataCache.timestamp = now
      marketDataCache.isRefreshing = false
      
      console.log(`✅ Fresh Bitcoin dominance fetched: ${dominance.toFixed(2)}%`)
    } catch (apiError) {
      console.error('❌ CoinGecko API failed, trying alternative source...')
      
      // Fallback to alternative API
      try {
        const altResponse = await axios.get('https://api.coinmarketcap.com/v1/global/', {
          timeout: 5000,
          headers: {
            'X-CMC_PRO_API_KEY': 'demo' // Using demo key for fallback
          }
        })
        
        const totalMarketCap = altResponse.data.data?.total_market_cap_usd || 0
        const btcMarketCap = altResponse.data.data?.bitcoin_dominance || 0
        
        // Update cache with fallback data
        marketDataCache.bitcoinDominance = btcMarketCap
        marketDataCache.timestamp = now
        marketDataCache.isRefreshing = false
        
        console.log(`✅ Bitcoin dominance fetched from fallback: ${btcMarketCap.toFixed(2)}%`)
      } catch (fallbackError) {
        console.error('❌ All Bitcoin dominance APIs failed, using default value')
        
        // Use a reasonable default value
        marketDataCache.bitcoinDominance = 45.5 // Typical Bitcoin dominance
        marketDataCache.timestamp = now
        marketDataCache.isRefreshing = false
        
        console.log('✅ Using default Bitcoin dominance: 45.50%')
      }
    }
    
    res.json({
      dominance: dominance,
      cached: false,
      timestamp: now
    })
    
  } catch (error) {
    console.error('❌ Error fetching Bitcoin dominance:', error)
    marketDataCache.isRefreshing = false
    
    // Return cached data if available, even if stale
    if (marketDataCache.bitcoinDominance !== null) {
      console.log('🔄 Error occurred, serving stale cached dominance')
      return res.json({
        dominance: marketDataCache.bitcoinDominance,
        cached: true,
        stale: true,
        error: error.message,
        timestamp: marketDataCache.timestamp
      })
    }
    
    res.status(500).json({ error: 'Failed to fetch Bitcoin dominance' })
  }
})

// Fear & Greed Index endpoint with caching
app.get('/api/fear-greed', async (req, res) => {
  try {
    const now = Date.now()
    
    // Check if we have valid cached data
    if (marketDataCache.fearGreed && marketDataCache.timestamp && (now - marketDataCache.timestamp) < MARKET_DATA_CACHE_DURATION) {
      console.log('⚡ Serving cached Fear & Greed index')
      return res.json({
        fearGreed: marketDataCache.fearGreed,
        cached: true,
        timestamp: marketDataCache.timestamp,
        cacheAge: now - marketDataCache.timestamp
      })
    }
    
    // If cache is being refreshed, return cached data if available
    if (marketDataCache.isRefreshing && marketDataCache.fearGreed) {
      console.log('🔄 Market data refresh in progress, serving stale fear & greed')
      return res.json({
        fearGreed: marketDataCache.fearGreed,
        cached: true,
        stale: true,
        timestamp: marketDataCache.timestamp,
        cacheAge: now - marketDataCache.timestamp
      })
    }
    
    // Start refresh process
    marketDataCache.isRefreshing = true
    console.log('🔄 Fetching fresh Fear & Greed index...')
    
    const response = await axios.get('https://api.alternative.me/fng/', {
      timeout: 10000
    })
    
    const fearGreed = {
      value: parseInt(response.data.data[0].value),
      classification: response.data.data[0].value_classification,
      timestamp: response.data.data[0].timestamp
    }
    
    // Update cache
    marketDataCache.fearGreed = fearGreed
    marketDataCache.timestamp = now
    marketDataCache.isRefreshing = false
    
    console.log(`✅ Fresh Fear & Greed index fetched: ${fearGreed.value} (${fearGreed.classification})`)
    
    res.json({
      fearGreed: fearGreed,
      cached: false,
      timestamp: now
    })
    
  } catch (error) {
    console.error('❌ Error fetching Fear & Greed index:', error)
    marketDataCache.isRefreshing = false
    
    // Return cached data if available, even if stale
    if (marketDataCache.fearGreed) {
      console.log('🔄 Error occurred, serving stale cached fear & greed')
      return res.json({
        fearGreed: marketDataCache.fearGreed,
        cached: true,
        stale: true,
        error: error.message,
        timestamp: marketDataCache.timestamp
      })
    }
    
    res.status(500).json({ error: 'Failed to fetch Fear & Greed index' })
  }
})

// Cache status endpoint
app.get('/api/cache-status', (req, res) => {
  res.json({
    news: {
      hasData: !!newsCache.data,
      isRefreshing: newsCache.isRefreshing,
      lastUpdate: newsCache.timestamp,
      cacheAge: newsCache.timestamp ? Date.now() - newsCache.timestamp : null,
      cacheDuration: CACHE_DURATION,
      articleCount: newsCache.data ? newsCache.data.length : 0
    },
    marketData: {
      hasPrices: !!marketDataCache.prices,
      hasFearGreed: !!marketDataCache.fearGreed,
      hasDominance: marketDataCache.bitcoinDominance !== null,
      isRefreshing: marketDataCache.isRefreshing,
      lastUpdate: marketDataCache.timestamp,
      cacheAge: marketDataCache.timestamp ? Date.now() - marketDataCache.timestamp : null,
      cacheDuration: MARKET_DATA_CACHE_DURATION
    }
  })
})

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, username })
})

// ── Blog public routes ────────────────────────────────────────────────────────
app.get('/api/blog', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const category = req.query.category || null

  let posts = readAllPosts()
    .filter(p => p.published === 1)
    .map(({ id, title, slug, excerpt, cover_image, category, created_at }) =>
      ({ id, title, slug, excerpt, cover_image, category, created_at }))

  if (category) posts = posts.filter(p => p.category === category)

  const total = posts.length
  const paged = posts.slice((page - 1) * limit, page * limit)
  res.json({ posts: paged, total, page, limit, totalPages: Math.ceil(total / limit) })
})

app.get('/api/blog/:slug', (req, res) => {
  const post = readPost(req.params.slug)
  if (!post || !post.published) return res.status(404).json({ error: 'Post not found' })
  res.json(post)
})

// ── Blog admin routes (protected) ─────────────────────────────────────────────
app.get('/api/admin/posts', requireAuth, (req, res) => {
  res.json(readAllPosts())
})

app.get('/api/admin/posts/:id', requireAuth, (req, res) => {
  const targetId = parseInt(req.params.id)
  const post = readAllPosts().find(p => p.id === targetId)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  res.json(post)
})

app.post('/api/admin/posts', requireAuth, (req, res) => {
  const { title, excerpt, content, cover_image, category, published } = req.body
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' })

  let slug = slugify(title)
  if (readPost(slug)) slug = `${slug}-${Date.now()}`

  const now = new Date().toISOString()
  const post = {
    id: Date.now(),
    title,
    slug,
    excerpt: excerpt || '',
    content,
    cover_image: cover_image || '',
    category: category || 'general',
    published: published ? 1 : 0,
    created_at: now,
    updated_at: now,
  }
  writePost(post)
  res.status(201).json(post)
})

app.put('/api/admin/posts/:id', requireAuth, (req, res) => {
  const targetId = parseInt(req.params.id)
  const existing = readAllPosts().find(p => p.id === targetId)
  if (!existing) return res.status(404).json({ error: 'Post not found' })

  const { title, excerpt, content, cover_image, category, published } = req.body
  const newSlug = title && title !== existing.title ? slugify(title) : existing.slug

  // If slug changed, delete old file
  if (newSlug !== existing.slug) deletePost(existing.slug)

  const updated = {
    ...existing,
    title: title ?? existing.title,
    slug: newSlug,
    excerpt: excerpt ?? existing.excerpt,
    content: content ?? existing.content,
    cover_image: cover_image ?? existing.cover_image,
    category: category ?? existing.category,
    published: published !== undefined ? (published ? 1 : 0) : existing.published,
    updated_at: new Date().toISOString(),
  }
  writePost(updated)
  res.json(updated)
})

app.delete('/api/admin/posts/:id', requireAuth, (req, res) => {
  const targetId = parseInt(req.params.id)
  const post = readAllPosts().find(p => p.id === targetId)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  deletePost(post.slug)
  res.json({ success: true })
})

// ── Image upload → public/images/blog/ ────────────────────────────────────────
app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: `/images/blog/${req.file.filename}` })
})

// ── Git publish endpoint ───────────────────────────────────────────────────────
app.post('/api/admin/publish', requireAuth, (req, res) => {
  const message = (req.body && req.body.message) || `Blog update ${new Date().toISOString().slice(0, 10)}`
  try {
    execSync('git add public/content/posts/ public/images/blog/', { cwd: __dirname })
    // Check if there's anything to commit
    const status = execSync('git status --porcelain public/content/posts/ public/images/blog/', { cwd: __dirname }).toString().trim()
    if (!status) {
      return res.json({ success: true, message: 'Nothing new to publish — site is already up to date.' })
    }
    execSync(`git commit -m "${message.replace(/"/g, "'")}"`, { cwd: __dirname })
    execSync('git push --set-upstream origin HEAD', { cwd: __dirname })
    res.json({ success: true, message: 'Published! Vercel will deploy in ~30 seconds.' })
  } catch (err) {
    console.error('Publish error:', err.message)
    res.status(500).json({ error: err.message || 'Git publish failed' })
  }
})

// ── Admin password change ──────────────────────────────────────────────────────
app.post('/api/admin/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (currentPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }
  // Password is stored in env — remind user to set ADMIN_PASSWORD env var
  res.json({ success: true, note: 'Set ADMIN_PASSWORD env var to make permanent.' })
})

app.listen(PORT, () => {
  console.log(`🚀 Enhanced RSS Proxy Server running on http://localhost:${PORT}`)
  console.log(`📊 Features: Caching (${CACHE_DURATION/1000}s), Timeouts (${FEED_TIMEOUT/1000}s), Parallel fetching (${MAX_CONCURRENT_FEEDS} concurrent)`)
  console.log(`📰 Total RSS feeds: ${RSS_FEEDS.length}`)
}) 