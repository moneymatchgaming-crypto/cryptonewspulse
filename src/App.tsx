import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import TopNewsCarousel from './components/TopNewsCarousel'
import FearGreedIndex from './components/FearGreedIndex'
import NewsGrid from './components/NewsGrid'
import CryptoPrices from './components/CryptoPrices'
import StructuredData from './components/StructuredData'
import { NewsItem, CryptoPrice } from './types'
import { ApiService } from './services/api'

function App() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState({ news: false, prices: false, fearGreed: false })
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [newsPagination, setNewsPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false
  })
  
  // Refs to store intervals
  const newsIntervalRef = useRef<NodeJS.Timeout>()
  const pricesIntervalRef = useRef<NodeJS.Timeout>()
  const fearGreedIntervalRef = useRef<NodeJS.Timeout>()

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    // Reset pagination when filter changes
    setNewsPagination(prev => ({
      ...prev,
      page: 1,
      hasMore: prev.totalPages > 1
    }))
  }

  // Initial data fetch - Fast loading for first page
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      console.log('🚀 Initial fast load...')
      
      try {
        const [fastNewsData, priceData] = await Promise.all([
          ApiService.getNewsFast(12), // Load only 12 articles initially
          ApiService.getCryptoPrices()
        ])
        
        setNews(fastNewsData.articles)
        setPrices(priceData)
        setLastUpdate(new Date())
        
        // Set initial pagination using the actual total from the backend
        const totalPages = Math.ceil(fastNewsData.total / 12)
        setNewsPagination({
          total: fastNewsData.total,
          page: 1,
          totalPages: totalPages,
          hasMore: totalPages > 1
        })
        
        console.log('✅ Initial fast load complete')
      } catch (error) {
        console.error('❌ Initial load failed:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Load more news when pagination changes
  const loadMoreNews = async (page: number) => {
    if (page === 1) return // Already loaded
    
    setRefreshing(prev => ({ ...prev, news: true }))
    try {
      console.log(`🔄 Loading page ${page}...`)
      const result = await ApiService.getNews(page, 12)
      
      // Always append to existing news for a better user experience
      setNews(prev => [...prev, ...result.articles])
      
      setNewsPagination({
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasMore: result.page < result.totalPages
      })
      
      setLastUpdate(new Date())
      console.log(`✅ Page ${page} loaded successfully`)
    } catch (error) {
      console.error(`❌ Failed to load page ${page}:`, error)
    } finally {
      setRefreshing(prev => ({ ...prev, news: false }))
    }
  }

  // Auto-refresh news every 8 minutes (full refresh)
  useEffect(() => {
    newsIntervalRef.current = setInterval(async () => {
      console.log('🔄 Auto-refreshing news...')
      setRefreshing(prev => ({ ...prev, news: true }))
      try {
        const result = await ApiService.getNews(1, 12)
        setNews(result.articles)
        setNewsPagination({
          total: result.total,
          page: 1,
          totalPages: result.totalPages,
          hasMore: result.totalPages > 1
        })
        setLastUpdate(new Date())
        console.log('✅ News refreshed successfully')
      } catch (error) {
        console.error('❌ Failed to refresh news:', error)
      } finally {
        setRefreshing(prev => ({ ...prev, news: false }))
      }
    }, 8 * 60 * 1000) // 8 minutes

    return () => {
      if (newsIntervalRef.current) {
        clearInterval(newsIntervalRef.current)
      }
    }
  }, [])

  // Auto-refresh prices every 2 minutes
  useEffect(() => {
    pricesIntervalRef.current = setInterval(async () => {
      console.log('🔄 Auto-refreshing prices...')
      setRefreshing(prev => ({ ...prev, prices: true }))
      try {
        const priceData = await ApiService.getCryptoPrices()
        setPrices(priceData)
        setLastUpdate(new Date())
        console.log('✅ Prices refreshed successfully')
      } catch (error) {
        console.error('❌ Failed to refresh prices:', error)
      } finally {
        setRefreshing(prev => ({ ...prev, prices: false }))
      }
    }, 2 * 60 * 1000) // 2 minutes

    return () => {
      if (pricesIntervalRef.current) {
        clearInterval(pricesIntervalRef.current)
      }
    }
  }, [])

  // Auto-refresh fear & greed index every 30 minutes
  useEffect(() => {
    fearGreedIntervalRef.current = setInterval(async () => {
      console.log('🔄 Auto-refreshing fear & greed index...')
      setRefreshing(prev => ({ ...prev, fearGreed: true }))
      try {
        // Force re-render of FearGreedIndex component
        setLastUpdate(new Date())
        console.log('✅ Fear & Greed index refreshed successfully')
      } catch (error) {
        console.error('❌ Failed to refresh fear & greed index:', error)
      } finally {
        setRefreshing(prev => ({ ...prev, fearGreed: false }))
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => {
      if (fearGreedIntervalRef.current) {
        clearInterval(fearGreedIntervalRef.current)
      }
    }
  }, [])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (newsIntervalRef.current) clearInterval(newsIntervalRef.current)
      if (pricesIntervalRef.current) clearInterval(pricesIntervalRef.current)
      if (fearGreedIntervalRef.current) clearInterval(fearGreedIntervalRef.current)
    }
  }, [])

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="min-h-screen bg-crypto-primary flex flex-col">
      <StructuredData type="website" />
      <Header selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-gold"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Auto-refresh status indicator */}
            <div className="flex items-center justify-between text-sm text-gray-400 bg-crypto-secondary/20 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                <span>Last updated: {formatLastUpdate(lastUpdate)}</span>
                <div className="flex items-center space-x-2">
                  {refreshing.news && (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-crypto-gold"></div>
                      <span>News</span>
                    </div>
                  )}
                  {refreshing.prices && (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-crypto-gold"></div>
                      <span>Prices</span>
                    </div>
                  )}
                  {refreshing.fearGreed && (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-crypto-gold"></div>
                      <span>Fear & Greed</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs">
                Auto-refresh: News (8m) | Prices (2m) | Fear & Greed (30m)
              </div>
            </div>

            {/* Top News Carousel - Moved to top for immediate news visibility */}
            <TopNewsCarousel articles={news} selectedFilter={selectedFilter} />
            
            <FearGreedIndex refreshKey={lastUpdate.getTime()} />
            <CryptoPrices prices={prices} refreshKey={lastUpdate.getTime()} />
            
            <NewsGrid 
              news={news} 
              pagination={newsPagination}
              onLoadMore={loadMoreNews}
              loading={refreshing.news}
              selectedCategory={selectedFilter}
              onCategoryChange={handleFilterChange}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App 