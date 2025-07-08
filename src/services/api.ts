import axios from 'axios'
import { NewsItem, CryptoPrice } from '../types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// RSS Feed URLs for crypto news (with fallbacks)
const RSS_FEEDS = [
  // Original feeds
  'https://cointelegraph.com/rss',
  'https://coindesk.com/arc/outboundfeeds/rss/',
  'https://cryptonews.com/news/feed',
  'https://bitcoinmagazine.com/.rss/full/',
  'https://decrypt.co/feed',
  'https://www.theblock.co/rss.xml',
  'https://www.newsbtc.com/feed/',
  'https://ambcrypto.com/feed/',
  'https://cryptoslate.com/feed/',
  
  // 🔵 General Crypto News
  'https://u.today/rss',
  'https://beincrypto.com/feed/',
  'https://cryptobriefing.com/feed/',
  'https://dailycoin.com/feed/',
  'https://blockonomi.com/feed/',
  'https://cryptopotato.com/feed/',
  'https://bitcoinist.com/feed/',
  'https://dailyhodl.com/feed/',
  
        // 🟢 Altcoin- & DeFi-Focused
      'https://ethereumworldnews.com/feed/',
      'https://thedefiant.io/feed',
      'https://www.dlnews.com/rss/',
      
      // 🔹 DeFi Protocol Blogs & News
      'https://newsletter.banklesshq.com/feed',
      'https://www.defirate.com/feed/',
      'https://yieldprotocol.com/feed.xml',
      'https://blog.instadapp.io/rss/',
      'https://blog.liquity.org/rss/',
      'https://medium.com/feed/aave',
      'https://medium.com/feed/curve-finance',
      'https://medium.com/feed/balancer-protocol',
      'https://blog.gmx.io/feed',
      'https://medium.com/feed/sushiswap-org',
      'https://medium.com/feed/yearn-finance',
      'https://dydx.exchange/blog/rss.xml',
  
  // 🟠 Analytics & On-Chain Insights
  'https://messari.io/rss',
  'https://blog.intotheblock.com/rss/',
  
  // ⚫️ Developer & Tech-Heavy
  'https://www.parity.io/feed/',
  'https://solana.com/news/rss.xml',
  'https://www.starkware.co/feed/',
  
        // 🔴 Bitcoin-Only Feeds
      'https://www.btctimes.com/rss',
      'https://blog.bitmex.com/feed/',
      
      // 🚀 Top Altcoin RSS Feeds
      'https://dailyhodl.com/altcoins/feed',
      'https://altcoininvestor.com/latest/rss',
      'https://www.coinspeaker.com/news/crypto/altcoins/',
      'https://blockchainreporter.net/altcoins',
      'https://cryptocoin.news/category/news/altcoin-news/',
      'https://altcoinbuzz.io/feed',
      'https://cryptonews.com/news/altcoin-news/',
      'https://altcointradershandbook.com/feed',
      'https://altcoinspekulant.com/feed',
      'https://blog.coinpayments.net/tag/altcoin/feed',
      'https://coinsutra.com/tag/altcoin/feed',
      'https://cryptocoinspy.com/tag/altcoins',
      'https://cryptoglobe.com/latest/altcoins',
      'https://globalcoinreport.com/category/altcoins',
      'https://doiownashitcoin.com/blog',
      'https://hitbtc.com/blog',
      'https://fuk.io/tag/altcoin/feed',
      'https://cryptoknowmics.com/news/altcoin',
      
      // 🎯 Other Notable Feeds
      'https://e-cryptonews.com/category/altcoin-news/',
      'https://coinjournal.net/feeds/',
      'https://www.ccn.com/news/crypto-news/feeds/',
      'https://www.ccn.com/analysis/crypto-analysis/feeds/',
      'https://tokeninsight.com/rss/news'
]

// CryptoPanic API (removed - using free APIs instead)

// Additional crypto news APIs
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data'
const MESSARI_API = 'https://data.messari.io/api/v1'
const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1'

export class ApiService {
  // Fetch news from backend (with caching) - Fast loading for initial page
  static async getNewsFast(limit: number = 12): Promise<{ articles: NewsItem[], total: number }> {
    console.log('🚀 Fetching news from RSS feeds...')
    
    try {
      // Try RSS2JSON API with API key
      const RSS2JSON_API_KEY = import.meta.env.VITE_RSS2JSON_API_KEY || 'YOUR_API_KEY_HERE'
      
      console.log('🔑 RSS2JSON API Key status:', RSS2JSON_API_KEY === 'YOUR_API_KEY_HERE' ? 'NOT CONFIGURED' : 'CONFIGURED')
      
      if (RSS2JSON_API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('⚠️ RSS2JSON API key not configured. Please add VITE_RSS2JSON_API_KEY to your environment variables.')
        throw new Error('API key not configured')
      }
      
      // Use the first few RSS feeds for fast loading, but get more articles for better pagination
      const fastFeeds = RSS_FEEDS.slice(0, 8) // Use more feeds for better coverage
      const feedPromises = fastFeeds.map(async (feedUrl, index) => {
        try {
          const response = await axios.get('https://api.rss2json.com/v1/api.json', {
            params: {
              rss_url: feedUrl,
              api_key: RSS2JSON_API_KEY,
              count: 15 // Get more articles per feed for better pagination
            },
            timeout: 10000
          })
          
          if (response.data && response.data.status === 'ok' && response.data.items) {
            return this.parseRSSFromJSON(response.data, index)
          }
        } catch (error) {
          console.log(`Failed to fetch ${feedUrl}:`, error.message)
        }
        return []
      })
      
      const results = await Promise.allSettled(feedPromises)
      const allArticles = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<NewsItem[]>).value)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      
      if (allArticles.length > 0) {
        // Return first page of articles, but provide total count for pagination
        const firstPageArticles = allArticles.slice(0, limit)
        console.log(`📰 Fetched ${firstPageArticles.length} articles from RSS feeds (${allArticles.length} total available)`)
        return { articles: firstPageArticles, total: allArticles.length }
      }
      
    } catch (error) {
      console.log('RSS2JSON API failed:', error.message)
    }
    
    // Fallback to CoinGecko news API (free, no token required)
    try {
      const coingeckoResponse = await axios.get(`${COINGECKO_API}/news`, {
        timeout: 8000
      })
      
      if (coingeckoResponse.data && coingeckoResponse.data.data) {
        const articles = coingeckoResponse.data.data.slice(0, limit).map((item: any) => ({
          id: `coingecko-${item.id}`,
          title: item.title,
          description: item.description,
          url: item.url,
          urlToImage: item.image?.small || 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
          publishedAt: item.published_at,
          source: { name: item.source || 'CoinGecko' },
          category: 'general' as const
        }))
        
        console.log(`📰 Fetched ${articles.length} articles from CoinGecko`)
        return { articles, total: articles.length }
      }
    } catch (coingeckoError) {
      console.log('CoinGecko API failed:', coingeckoError.message)
    }
    
    // Final fallback: return sample news
    const sampleNews: NewsItem[] = [
      {
        id: 'sample-1',
        title: 'Bitcoin Surges Past Key Resistance Level',
        description: 'Bitcoin has broken through a major resistance level, signaling potential bullish momentum in the crypto market.',
        url: 'https://cointelegraph.com',
        urlToImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
        publishedAt: new Date().toISOString(),
        source: { name: 'CryptoNewsPulse' },
        category: 'bitcoin'
      },
      {
        id: 'sample-2',
        title: 'Ethereum Layer 2 Solutions Gain Traction',
        description: 'Layer 2 scaling solutions on Ethereum are seeing increased adoption as gas fees remain high.',
        url: 'https://coindesk.com',
        urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
        publishedAt: new Date().toISOString(),
        source: { name: 'CryptoNewsPulse' },
        category: 'ethereum'
      }
    ]
    
    console.log(`📰 Using sample news (${sampleNews.length} articles)`)
    return { articles: sampleNews, total: sampleNews.length }
  }

  // Fetch news from backend (with caching) - Full content with pagination
  static async getNews(page: number = 1, limit: number = 12): Promise<{ articles: NewsItem[], total: number, page: number, totalPages: number }> {
    console.log(`🚀 Fetching news from RSS feeds (page ${page}, limit ${limit})...`)
    
    try {
      // Try RSS2JSON API with API key
      const RSS2JSON_API_KEY = import.meta.env.VITE_RSS2JSON_API_KEY || 'YOUR_API_KEY_HERE'
      
      console.log('🔑 RSS2JSON API Key status:', RSS2JSON_API_KEY === 'YOUR_API_KEY_HERE' ? 'NOT CONFIGURED' : 'CONFIGURED')
      
      if (RSS2JSON_API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('⚠️ RSS2JSON API key not configured. Please add VITE_RSS2JSON_API_KEY to your environment variables.')
        throw new Error('API key not configured')
      }
      
      // Fetch from all RSS feeds
      const feedPromises = RSS_FEEDS.map(async (feedUrl, index) => {
        try {
          const response = await axios.get('https://api.rss2json.com/v1/api.json', {
            params: {
              rss_url: feedUrl,
              api_key: RSS2JSON_API_KEY,
              count: 20 // Get more articles for pagination
            },
            timeout: 10000
          })
          
          if (response.data && response.data.status === 'ok' && response.data.items) {
            return this.parseRSSFromJSON(response.data, index)
          }
        } catch (error) {
          console.log(`Failed to fetch ${feedUrl}:`, error.message)
        }
        return []
      })
      
      const results = await Promise.allSettled(feedPromises)
      const allArticles = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<NewsItem[]>).value)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      
      if (allArticles.length > 0) {
        // Apply pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const articles = allArticles.slice(startIndex, endIndex)
        const total = allArticles.length
        const totalPages = Math.ceil(total / limit)
        
        console.log(`📰 Fetched ${articles.length} articles from RSS feeds (page ${page}/${totalPages})`)
        return { articles, total, page, totalPages }
      }
      
    } catch (error) {
      console.log('RSS2JSON API failed:', error.message)
    }
    
    // Fallback to CoinGecko news API (free, no token required)
    try {
      const coingeckoResponse = await axios.get(`${COINGECKO_API}/news`, {
        timeout: 8000
      })
      
      if (coingeckoResponse.data && coingeckoResponse.data.data) {
        const allArticles = coingeckoResponse.data.data.map((item: any) => ({
          id: `coingecko-${item.id}`,
          title: item.title,
          description: item.description,
          url: item.url,
          urlToImage: item.image?.small || 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
          publishedAt: item.published_at,
          source: { name: item.source || 'CoinGecko' },
          category: 'general' as const
        }))
        
        // Apply pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const articles = allArticles.slice(startIndex, endIndex)
        const total = allArticles.length
        const totalPages = Math.ceil(total / limit)
        
        console.log(`📰 Fetched ${articles.length} articles from CoinGecko (page ${page}/${totalPages})`)
        return { articles, total, page, totalPages }
      }
    } catch (coingeckoError) {
      console.log('CoinGecko API failed:', coingeckoError.message)
    }
    
    // Final fallback: return sample news
    const sampleNews: NewsItem[] = [
      {
        id: 'sample-1',
        title: 'Bitcoin Surges Past Key Resistance Level',
        description: 'Bitcoin has broken through a major resistance level, signaling potential bullish momentum in the crypto market.',
        url: 'https://cointelegraph.com',
        urlToImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
        publishedAt: new Date().toISOString(),
        source: { name: 'CryptoNewsPulse' },
        category: 'bitcoin'
      },
      {
        id: 'sample-2',
        title: 'Ethereum Layer 2 Solutions Gain Traction',
        description: 'Layer 2 scaling solutions on Ethereum are seeing increased adoption as gas fees remain high.',
        url: 'https://coindesk.com',
        urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
        publishedAt: new Date().toISOString(),
        source: { name: 'CryptoNewsPulse' },
        category: 'ethereum'
      }
    ]
    
    console.log(`📰 Using sample news (${sampleNews.length} articles)`)
    return { articles: sampleNews, total: sampleNews.length, page: 1, totalPages: 1 }
  }

  // Fetch cryptocurrency prices from CoinGecko (with caching)
  static async getCryptoPrices(ids: string[] = ['bitcoin', 'ethereum', 'ripple', 'solana', 'binancecoin', 'tron']): Promise<CryptoPrice[]> {
    try {
      console.log('🚀 Fetching crypto prices from enhanced backend...')
      
      // Use the new cached backend endpoint
      const response = await axios.get(`${API_BASE_URL}/api/crypto-prices`, {
        timeout: 10000
      })
      
      const { prices, cached, timestamp, cacheAge, stale } = response.data
      
      console.log(`📊 Prices response: ${prices.length} coins, cached: ${cached}, stale: ${stale || false}`)
      if (cached && cacheAge) {
        console.log(`⏰ Cache age: ${Math.round(cacheAge / 1000)}s`)
      }
      
      return prices
    } catch (error) {
      console.error('❌ Error fetching prices from backend:', error)
      
      // Fallback to direct API if backend is not available
      console.log('🔄 Falling back to direct CoinGecko API...')
      try {
        const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            ids: ids.join(','),
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
            locale: 'en'
          },
          timeout: 10000
        })
        
        return response.data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          image: coin.image
        }))
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return []
      }
    }
  }

  // Fetch Bitcoin dominance data (with caching)
  static async getBitcoinDominance(): Promise<number> {
    try {
      console.log('🚀 Fetching Bitcoin dominance from enhanced backend...')
      
      // Use the new cached backend endpoint
      const response = await axios.get(`${API_BASE_URL}/api/bitcoin-dominance`, {
        timeout: 10000
      })
      
      const { dominance, cached, timestamp, cacheAge, stale } = response.data
      
      console.log(`📊 Dominance response: ${dominance.toFixed(2)}%, cached: ${cached}, stale: ${stale || false}`)
      if (cached && cacheAge) {
        console.log(`⏰ Cache age: ${Math.round(cacheAge / 1000)}s`)
      }
      
      return dominance
    } catch (error) {
      console.error('❌ Error fetching dominance from backend:', error)
      
      // Fallback to direct API if backend is not available
      console.log('🔄 Falling back to direct CoinGecko API...')
      try {
        const response = await axios.get(`${COINGECKO_API}/global`, {
          timeout: 10000
        })
        
        const data = response.data
        
        if (data.data && data.data.market_cap_percentage) {
          const btcDominance = data.data.market_cap_percentage.btc || 0
          console.log('✅ Bitcoin dominance (fallback):', btcDominance.toFixed(2) + '%')
          return btcDominance
        } else {
          console.error('❌ No market cap percentage data found in response')
          return 0
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return 0
      }
    }
  }

  // Fetch Fear & Greed Index (with caching)
  static async getFearGreedIndex(): Promise<{ value: number; classification: string; timestamp: string }> {
    try {
      console.log('🚀 Fetching Fear & Greed index from enhanced backend...')
      
      // Use the new cached backend endpoint
      const response = await axios.get(`${API_BASE_URL}/api/fear-greed`, {
        timeout: 10000
      })
      
      const { fearGreed, cached, timestamp, cacheAge, stale } = response.data
      
      console.log(`📊 Fear & Greed response: ${fearGreed.value} (${fearGreed.classification}), cached: ${cached}, stale: ${stale || false}`)
      if (cached && cacheAge) {
        console.log(`⏰ Cache age: ${Math.round(cacheAge / 1000)}s`)
      }
      
      return fearGreed
    } catch (error) {
      console.error('❌ Error fetching Fear & Greed from backend:', error)
      
      // Fallback to direct API if backend is not available
      console.log('🔄 Falling back to direct API...')
      try {
        const response = await axios.get('https://api.alternative.me/fng/', {
          timeout: 10000
        })
        
        return {
          value: parseInt(response.data.data[0].value),
          classification: response.data.data[0].value_classification,
          timestamp: response.data.data[0].timestamp
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return {
          value: 50,
          classification: 'Neutral',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // Fetch news from CoinGecko status updates
  static async getNewsFromCoinGecko(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${COINGECKO_API}/status_updates`, {
        params: {
          per_page: 20
        }
      })

      return response.data.status_updates.map((update: any, index: number) => ({
        id: `coingecko-${update.id || index}`,
        title: update.title,
        description: update.description,
        url: update.project_url || '#',
        urlToImage: this.getDefaultImage(1),
        publishedAt: update.created_at,
        source: { name: update.project?.name || 'CoinGecko' },
        category: this.categorizeNews(update.title, update.description)
      }))
    } catch (error) {
      console.error('Error fetching news from CoinGecko:', error)
      return []
    }
  }

  // Fetch news from CryptoCompare API
  static async getNewsFromCryptoCompare(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${CRYPTOCOMPARE_API}/news/`, {
        params: {
          lang: 'EN',
          sortOrder: 'latest'
        }
      })

      return response.data.Data.map((article: any, index: number) => ({
        id: `cryptocompare-${article.id || index}`,
        title: article.title,
        description: article.body,
        url: article.url,
        urlToImage: article.imageurl || this.getDefaultImage(2),
        publishedAt: new Date(article.published_on * 1000).toISOString(),
        source: { name: article.source || 'CryptoCompare' },
        category: this.categorizeNews(article.title, article.body)
      }))
    } catch (error) {
      console.error('Error fetching news from CryptoCompare:', error)
      return []
    }
  }

  // Fetch news from Messari API (free tier)
  static async getNewsFromMessari(): Promise<NewsItem[]> {
    try {
      // Get trending assets first
      const trendingResponse = await axios.get(`${MESSARI_API}/assets/trending`)
      const trendingAssets = trendingResponse.data.data.slice(0, 5)
      
      const newsPromises = trendingAssets.map(async (asset: any) => {
        try {
          const newsResponse = await axios.get(`${MESSARI_API}/assets/${asset.slug}/news`)
          return newsResponse.data.data.map((article: any, index: number) => ({
            id: `messari-${asset.slug}-${index}`,
            title: article.title,
            description: article.content,
            url: article.url,
            urlToImage: this.getDefaultImage(3),
            publishedAt: article.published_at,
            source: { name: article.author?.name || 'Messari' },
            category: this.categorizeNews(article.title, article.content)
          }))
        } catch (error) {
          return []
        }
      })
      
      const results = await Promise.all(newsPromises)
      return results.flat().slice(0, 15)
    } catch (error) {
      console.error('Error fetching news from Messari:', error)
      return []
    }
  }

  // Fetch news from CoinGecko news endpoint (newer API)
  static async getNewsFromCoinGeckoNews(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${COINGECKO_API}/news`, {
        params: {
          per_page: 20
        }
      })

      return response.data.map((article: any, index: number) => ({
        id: `coingecko-news-${index}`,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image || this.getDefaultImage(4),
        publishedAt: article.published_at,
        source: { name: article.source || 'CoinGecko News' },
        category: this.categorizeNews(article.title, article.description)
      }))
    } catch (error) {
      console.error('Error fetching news from CoinGecko News:', error)
      return []
    }
  }

  // Fetch news from CryptoSlate API (free)
  static async getNewsFromCryptoSlate(): Promise<NewsItem[]> {
    try {
      const response = await axios.get('https://cryptoslate.com/wp-json/wp/v2/posts', {
        params: {
          per_page: 15,
          _embed: true
        }
      })

      return response.data.map((post: any, index: number) => ({
        id: `cryptoslate-${post.id}`,
        title: post.title.rendered,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, ''),
        url: post.link,
        urlToImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || this.getDefaultImage(5),
        publishedAt: post.date,
        source: { name: 'CryptoSlate' },
        category: this.categorizeNews(post.title.rendered, post.excerpt.rendered)
      }))
    } catch (error) {
      console.error('Error fetching news from CryptoSlate:', error)
      return []
    }
  }

  // Parse RSS feeds with multiple CORS proxies
  static async getNewsFromRSS(): Promise<NewsItem[]> {
    try {
      // Multiple CORS proxies to try (updated with more reliable ones)
      const CORS_PROXIES = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://cors.bridged.cc/',
        'https://cors.eu.org/'
      ]
      
      const newsPromises = RSS_FEEDS.map(async (feedUrl, feedIndex) => {
        // Special debugging for CryptoNews feed
        if (feedIndex === 2) {
          console.log(`🔍 Special debugging for CryptoNews feed (index ${feedIndex}): ${feedUrl}`)
        }
        
        // First try CORS proxies
        for (const proxy of CORS_PROXIES) {
          try {
            console.log(`Trying ${feedUrl} with proxy: ${proxy}`)
            const response = await axios.get(`${proxy}${encodeURIComponent(feedUrl)}`, {
              timeout: 10000, // 10 second timeout
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            })
            
            if (response.data && response.data.length > 0) {
              const parsedNews = this.parseRSSFeed(response.data, feedIndex)
              if (parsedNews.length > 0) {
                console.log(`✅ Successfully fetched RSS feed: ${feedUrl} (${parsedNews.length} articles)`)
                
                // Special debugging for CryptoNews
                if (feedIndex === 2) {
                  console.log(`🎯 CryptoNews articles found:`, parsedNews.slice(0, 3).map(article => ({
                    title: article.title.substring(0, 50) + '...',
                    source: article.source.name,
                    id: article.id
                  })))
                }
                
                return parsedNews
              }
            }
                  } catch (error: any) {
          console.log(`❌ Failed to fetch ${feedUrl} with proxy ${proxy}:`, error.message)
            continue
          }
        }
        
        // If CORS proxies fail, try local proxy server
        try {
          console.log(`Trying local proxy server for: ${feedUrl}`)
          const response = await axios.get(`http://localhost:3001/api/rss/${feedIndex}`, {
            timeout: 10000
          })
          
          if (response.data && response.data.rss && response.data.rss.channel) {
            const parsedNews = this.parseRSSFromJSON(response.data, feedIndex)
            if (parsedNews.length > 0) {
              console.log(`✅ Successfully fetched RSS feed via local proxy: ${feedUrl} (${parsedNews.length} articles)`)
              return parsedNews
            }
          }
        } catch (error: any) {
          console.log(`❌ Local proxy also failed for: ${feedUrl}`, error.message)
        }
        
        console.log(`❌ All methods failed for RSS feed: ${feedUrl}`)
        return []
      })

      const results = await Promise.all(newsPromises)
      const allNews = results.flat()
      console.log(`📊 Total RSS articles fetched: ${allNews.length}`)
      
      // Debug: Show breakdown by source for RSS feeds specifically
      const rssSourceBreakdown = allNews.reduce((acc: Record<string, number>, article: any) => {
        const source = article.source.name
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('📰 RSS-only article breakdown by source:', rssSourceBreakdown)
      
      return allNews // Removed the .slice(0, 50) limit - return all RSS articles
    } catch (error) {
      console.error('Error fetching RSS feeds:', error)
      return []
    }
  }

  // Parse RSS XML to NewsItem objects
  private static parseRSSFeed(xmlString: string, feedIndex: number): NewsItem[] {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      const items = xmlDoc.querySelectorAll('item')
      
      console.log(`🔍 Parsing RSS feed ${feedIndex}: Found ${items.length} items`)
      
      const parsedItems = Array.from(items).map((item, index) => {
        const title = item.querySelector('title')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString()
        
        // Try to extract image from description or use default
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/)
        const imageUrl = imgMatch ? imgMatch[1] : this.getDefaultImage(feedIndex)
        
        const newsItem = {
          id: `rss-${feedIndex}-${index}`,
          title: this.cleanText(title),
          description: this.cleanText(description),
          url: link,
          urlToImage: imageUrl,
          publishedAt: new Date(pubDate).toISOString(),
          source: { name: this.getSourceName(feedIndex) },
          category: this.categorizeNews(title, description)
        }
        
        // Debug: Log first few items
        if (index < 3) {
          console.log(`📰 RSS Item ${index}:`, {
            title: newsItem.title.substring(0, 50) + '...',
            source: newsItem.source.name,
            category: newsItem.category
          })
        }
        
        return newsItem
      })
      
      console.log(`✅ Successfully parsed ${parsedItems.length} items from RSS feed ${feedIndex}`)
      return parsedItems
    } catch (error) {
      console.error('Error parsing RSS feed:', error)
      console.error('XML content preview:', xmlString.substring(0, 500))
      return []
    }
  }

  // Parse RSS JSON (from RSS2JSON API) to NewsItem objects
  private static parseRSSFromJSON(jsonData: any, feedIndex: number): NewsItem[] {
    try {
      // Check if this is an error response from RSS2JSON
      if (jsonData.status === 'error') {
        console.log(`RSS2JSON error for feed ${feedIndex}:`, jsonData.message)
        return []
      }
      
      // RSS2JSON API returns items directly in the items array
      const items = jsonData.items || []
      
      return items.map((item: any, index: number) => {
        const title = item.title || ''
        const description = item.description || ''
        const link = item.link || ''
        const pubDate = item.pubDate || new Date().toISOString()
        const imageUrl = item.thumbnail || this.getDefaultImage(feedIndex)
        
        return {
          id: `rss-json-${feedIndex}-${index}`,
          title: this.cleanText(title),
          description: this.cleanText(description),
          url: link,
          urlToImage: imageUrl,
          publishedAt: new Date(pubDate).toISOString(),
          source: { name: this.getSourceName(feedIndex) },
          category: this.categorizeNews(title, description)
        }
      })
    } catch (error) {
      console.error('Error parsing RSS JSON:', error)
      return []
    }
  }

  // Categorize news based on keywords
  private static categorizeNews(title: string, description: string): NewsItem['category'] {
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

  // Clean HTML tags from text
  private static cleanText(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
  }

  // Get default image based on feed source
  private static getDefaultImage(feedIndex: number): string {
    const defaultImages = [
      // Bitcoin & General Crypto
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
      // Ethereum & DeFi
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      // DeFi & Finance
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      // NFT & Digital Assets
      'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400',
      // Regulation & Policy
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      // General Crypto
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      // Technology & Development
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      // Analytics & Data
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      // Altcoins
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400'
    ]
    return defaultImages[feedIndex % defaultImages.length]
  }

  // Get source name based on feed index
  private static getSourceName(feedIndex: number): string {
    const sources = [
      // Original feeds
      'CoinTelegraph',    // 0: cointelegraph.com/rss
      'CoinDesk',         // 1: coindesk.com/arc/outboundfeeds/rss/
      'CryptoNews',       // 2: cryptonews.com/news/feed
      'Bitcoin Magazine', // 3: bitcoinmagazine.com/.rss/full/
      'Decrypt',          // 4: decrypt.co/feed
      'The Block',        // 5: theblock.co/rss.xml
      'NewsBTC',          // 6: newsbtc.com/feed/
      'AMBCrypto',        // 7: ambcrypto.com/feed/
      'CryptoSlate',      // 8: cryptoslate.com/feed/
      
      // 🔵 General Crypto News
      'U.Today',          // 9: u.today/rss
      'BeInCrypto',       // 10: beincrypto.com/feed/
      'Crypto Briefing',  // 11: cryptobriefing.com/feed/
      'DailyCoin',        // 12: dailycoin.com/feed/
      'Blockonomi',       // 13: blockonomi.com/feed/
      'CryptoPotato',     // 14: cryptopotato.com/feed/
      'Bitcoinist',       // 15: bitcoinist.com/feed/
      'The Daily Hodl',   // 16: dailyhodl.com/feed/
      
      // 🟢 Altcoin- & DeFi-Focused
      'Ethereum World News', // 17: ethereumworldnews.com/feed/
      'The Defiant',      // 18: thedefiant.io/feed
      'DLNews',           // 19: dlnews.com/rss/
      
      // 🔹 DeFi Protocol Blogs & News
      'Bankless',         // 20: newsletter.banklesshq.com/feed
      'DeFi Rate',        // 21: defirate.com/feed/
      'Yield Protocol',   // 22: yieldprotocol.com/feed.xml
      'Instadapp',        // 23: blog.instadapp.io/rss/
      'Liquity',          // 24: blog.liquity.org/rss/
      'Aave',             // 25: medium.com/feed/aave
      'Curve Finance',    // 26: medium.com/feed/curve-finance
      'Balancer',         // 27: medium.com/feed/balancer-protocol
      'GMX',              // 28: blog.gmx.io/feed
      'SushiSwap',        // 29: medium.com/feed/sushiswap-org
      'Yearn Finance',    // 30: medium.com/feed/yearn-finance
      'dYdX',             // 31: dydx.exchange/blog/rss.xml
      
      // 🟠 Analytics & On-Chain Insights
      'Messari Blog',     // 32: messari.io/rss
      'IntoTheBlock',     // 33: blog.intotheblock.com/rss/
      
      // ⚫️ Developer & Tech-Heavy
      'Parity Technologies', // 34: parity.io/feed/
      'Solana Blog',      // 35: solana.com/news/rss.xml
      'StarkWare Blog',   // 36: starkware.co/feed/
      
      // 🔴 Bitcoin-Only Feeds
      'BTC Times',        // 39: btctimes.com/rss
      'BitMEX Research',  // 40: blog.bitmex.com/feed/
      
      // 🚀 Top Altcoin RSS Feeds
      'Daily Hodl Altcoins', // 41: dailyhodl.com/altcoins/feed
      'Altcoin Investor',    // 42: altcoininvestor.com/latest/rss
      'CoinSpeaker',         // 43: coinspeaker.com/news/crypto/altcoins/
      'Blockchain Reporter', // 44: blockchainreporter.net/altcoins
      'CryptoCoin News',     // 45: cryptocoin.news/category/news/altcoin-news/
      'Altcoin Buzz',        // 46: altcoinbuzz.io/feed
      'CryptoNews Altcoins', // 47: cryptonews.com/news/altcoin-news/
      'Altcoin Trader Handbook', // 48: altcointradershandbook.com/feed
      'Altcoin Speculator',  // 49: altcoinspekulant.com/feed
      'CoinPayments Blog',   // 50: blog.coinpayments.net/tag/altcoin/feed
      'CoinSutra',           // 51: coinsutra.com/tag/altcoin/feed
      'CryptoCoin Spy',      // 52: cryptocoinspy.com/tag/altcoins
      'CryptoGlobe',         // 53: cryptoglobe.com/latest/altcoins
      'Global Coin Report',  // 54: globalcoinreport.com/category/altcoins
      'Do I Own a Shitcoin', // 55: doiownashitcoin.com/blog
      'HitBTC Blog',         // 56: hitbtc.com/blog
      'Financial Underground', // 57: fuk.io/tag/altcoin/feed
      'CryptoKnowmics',      // 58: cryptoknowmics.com/news/altcoin
      
      // 🎯 Other Notable Feeds
      'E-Crypto News',       // 59: e-cryptonews.com/category/altcoin-news/
      'CoinJournal',         // 60: coinjournal.net/feeds/
      'CCN News',            // 61: ccn.com/news/crypto-news/feeds/
      'CCN Analysis',        // 62: ccn.com/analysis/crypto-analysis/feeds/
      'TokenInsight'         // 63: tokeninsight.com/rss/news
    ]
    return sources[feedIndex] || 'Crypto News'
  }

  // Combined method to get all news from multiple sources
  static async getAllNews(): Promise<NewsItem[]> {
    try {
      console.log('🚀 Fetching news from enhanced backend...')
      
      // Use the new cached backend endpoint
      const response = await axios.get('http://localhost:3001/api/news', {
        timeout: 10000
      })
      
      const { news, cached, timestamp, cacheAge, stale } = response.data
      
      console.log(`📊 Backend response: ${news.length} articles, cached: ${cached}, stale: ${stale || false}`)
      if (cached && cacheAge) {
        console.log(`⏰ Cache age: ${Math.round(cacheAge / 1000)}s`)
      }
      
      // Debug: Show breakdown by source
      const sourceBreakdown = news.reduce((acc: Record<string, number>, article: any) => {
        const source = article.source.name
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('📊 Article breakdown by source:', sourceBreakdown)
      
      return news
    } catch (error) {
      console.error('❌ Error fetching news from backend:', error)
      
      // Fallback to old method if backend is not available
      console.log('🔄 Falling back to direct RSS fetching...')
      try {
        const [rssNews, coingeckoNews, cryptocompareNews, messariNews, coingeckoNews2, cryptoslateNews] = await Promise.all([
          this.getNewsFromRSS(),
          this.getNewsFromCoinGecko(),
          this.getNewsFromCryptoCompare(),
          this.getNewsFromMessari(),
          this.getNewsFromCoinGeckoNews(),
          this.getNewsFromCryptoSlate()
        ])
        
        // Combine all news sources and sort by date
        const allNews = [...rssNews, ...coingeckoNews, ...cryptocompareNews, ...messariNews, ...coingeckoNews2, ...cryptoslateNews]
        console.log(`📄 Fallback: ${allNews.length} articles from direct sources`)
        
        const sortedNews = allNews
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 200)
        
        return sortedNews
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return []
      }
    }
  }
} 