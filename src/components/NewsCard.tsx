import { Calendar, ExternalLink, Clock } from 'lucide-react'
import { NewsItem } from '../types'

interface NewsCardProps {
  news: NewsItem
}

const NewsCard = ({ news }: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      bitcoin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      ethereum: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      defi: 'bg-green-500/20 text-green-400 border-green-500/30',
      nft: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      regulation: 'bg-red-500/20 text-red-400 border-red-500/30',
      general: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <article className="bg-crypto-primary rounded-lg overflow-hidden border border-crypto-accent/20 hover:border-crypto-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-crypto-gold/10 cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={news.urlToImage}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400'
            }}
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
              {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-crypto-gold transition-colors">
            {news.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {news.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(news.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>{formatTime(news.publishedAt)}</span>
            </div>
          </div>

          {/* Source and Read More */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-crypto-gold font-medium">
              {news.source.name}
            </span>
            <div className="flex items-center space-x-1 text-crypto-accent hover:text-crypto-gold transition-colors">
              <span className="text-sm">Read More</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </article>
    </a>
  )
}

export default NewsCard 