import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Clock } from 'lucide-react'
import { NewsItem } from '../types'

interface TopNewsCarouselProps {
  articles: NewsItem[]
  selectedFilter?: string
}

// Scoring algorithm for determining top news
const calculateArticleScore = (article: NewsItem): number => {
  let score = 0
  
  // Source authority scoring
  const authoritySources = [
    'cointelegraph.com', 'coindesk.com', 'decrypt.co', 'theblock.co',
    'bitcoinmagazine.com', 'cryptonews.com', 'newsbtc.com'
  ]
  
  const sourceUrl = article.source?.name?.toLowerCase() || ''
  if (authoritySources.some(source => sourceUrl.includes(source))) {
    score += 50
  }
  
  // Keyword scoring
  const title = article.title.toLowerCase()
  const description = article.description?.toLowerCase() || ''
  const content = `${title} ${description}`
  
  const highImpactKeywords = [
    'bitcoin', 'ethereum', 'sec', 'regulation', 'etf', 'halving',
    'breaking', 'just in', 'update', 'announcement', 'launch'
  ]
  
  const mediumImpactKeywords = [
    'price', 'market', 'crypto', 'blockchain', 'defi', 'nft',
    'exchange', 'wallet', 'mining', 'staking'
  ]
  
  highImpactKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 20
  })
  
  mediumImpactKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 10
  })
  
  // Freshness scoring (articles from last 4 hours get bonus)
  const publishDate = new Date(article.publishedAt)
  const hoursSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60)
  
  if (hoursSincePublish <= 1) score += 30
  else if (hoursSincePublish <= 4) score += 20
  else if (hoursSincePublish <= 24) score += 10
  
  // Title quality scoring
  if (article.title.length > 50) score += 15
  if (article.title.includes('$') || article.title.includes('%')) score += 10
  
  return score
}

const TopNewsCarousel = ({ articles, selectedFilter = 'all' }: TopNewsCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Filter articles based on selected filter
  const filteredArticles = selectedFilter === 'all' 
    ? articles 
    : articles.filter(item => item.category === selectedFilter)
  
  // Score and sort articles to get top news
  const topArticles = filteredArticles
    .map(article => ({ ...article, score: calculateArticleScore(article) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Top 5 articles
  
  const startAutoAdvance = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide(prev => (prev + 1) % topArticles.length)
      }
    }, 6000) // Change slide every 6 seconds
  }
  
  const stopAutoAdvance = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }
  
  useEffect(() => {
    if (topArticles.length > 1) {
      startAutoAdvance()
    }
    
    return () => stopAutoAdvance()
  }, [topArticles.length, isPaused])
  
  // Reset to first slide when filter changes
  useEffect(() => {
    setCurrentSlide(0)
  }, [selectedFilter])
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }
  
  const goToPrevious = () => {
    setCurrentSlide(prev => (prev - 1 + topArticles.length) % topArticles.length)
  }
  
  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % topArticles.length)
  }
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }
  
  if (topArticles.length === 0) return null
  
  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-crypto-gold rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">🔥 Top News</h2>
          {selectedFilter !== 'all' && (
            <span className="px-2 py-1 bg-crypto-accent/20 text-crypto-gold text-sm rounded">
              {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400">
          Auto-advancing in {isPaused ? 'paused' : '6s'}
        </div>
      </div>
      
      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-xl bg-crypto-secondary/20 border border-crypto-accent/20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {topArticles.map((article, index) => (
            <div key={article.id} className="w-full flex-shrink-0">
              <div className="relative h-96 md:h-[500px]">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${article.urlToImage || 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=600&fit=crop'})`
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-crypto-primary via-crypto-primary/80 to-transparent"></div>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-4xl">
                    {/* Source and Time */}
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="px-3 py-1 bg-crypto-gold/20 text-crypto-gold text-sm font-medium rounded-full">
                        {article.source?.name || 'Crypto News'}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-300 text-sm">
                        <Clock size={14} />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      {article.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-200 text-lg mb-6 line-clamp-2">
                      {article.description}
                    </p>
                    
                    {/* Read More Button */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-crypto-gold text-crypto-primary font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      <span>Read Full Article</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        {topArticles.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-crypto-primary/80 hover:bg-crypto-primary text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-crypto-primary/80 hover:bg-crypto-primary text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Dots Indicator */}
        {topArticles.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {topArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-crypto-gold scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TopNewsCarousel 