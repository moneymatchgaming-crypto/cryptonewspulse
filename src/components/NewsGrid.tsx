import { Calendar, ExternalLink, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { NewsItem, NewsCategory } from '../types'
import NewsCard from './NewsCard'

interface NewsGridProps {
  news: NewsItem[]
  pagination: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
  onLoadMore: (page: number) => void
  loading?: boolean
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const NewsGrid = ({ 
  news, 
  pagination, 
  onLoadMore, 
  loading = false, 
  selectedCategory, 
  onCategoryChange 
}: NewsGridProps) => {
  const categories: NewsCategory[] = [
    { id: 'all', name: 'all', label: 'All News' },
    { id: 'bitcoin', name: 'bitcoin', label: 'Bitcoin' },
    { id: 'ethereum', name: 'ethereum', label: 'Ethereum' },
    { id: 'defi', name: 'defi', label: 'DeFi' },
    { id: 'nft', name: 'nft', label: 'NFTs' },
    { id: 'regulation', name: 'regulation', label: 'Regulation' },
    { id: 'general', name: 'general', label: 'General' }
  ]

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  // Reset to first page when category changes
  const handleCategoryChange = (category: string) => {
    onCategoryChange(category)
    onLoadMore(1)
  }

  if (news.length === 0 || loading) {
    return (
      <section className="card">
        <h2 className="text-2xl font-bold mb-6 text-crypto-gold">Latest News</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-crypto-gold">Latest News</h2>
          <span className="text-sm text-gray-400">
            {pagination.total} articles
          </span>
        </div>
        
        {/* Category Filter - Now hidden since filtering is in header */}
        <div className="hidden">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-crypto-primary border border-crypto-accent/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crypto-gold"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No news articles found for this category.</p>
        </div>
      )}

      {/* See More Button */}
      {pagination.hasMore && !loading && (
        <div className="flex justify-center mt-8 pt-6 border-t border-crypto-accent/20">
          <button
            onClick={() => onLoadMore(pagination.page + 1)}
            className="px-6 py-3 rounded-lg bg-crypto-gold text-crypto-primary font-semibold shadow hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            See More
          </button>
        </div>
      )}
    </section>
  )
}

export default NewsGrid 