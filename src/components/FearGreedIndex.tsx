import { TrendingUp, TrendingDown, AlertTriangle, Smile, Meh, Frown } from 'lucide-react'
import { useState, useEffect } from 'react'

interface FearGreedData {
  value: number
  value_classification: string
  timestamp: string
  time_until_update: number
}

interface FearGreedIndexProps {
  refreshKey?: number
}

const FearGreedIndex = ({ refreshKey }: FearGreedIndexProps) => {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState<Date>(new Date())

  useEffect(() => {
    fetchFearGreedIndex()
  }, [refreshKey]) // Re-fetch when refreshKey changes

  const fetchFearGreedIndex = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching Fear & Greed Index...')
      
      // Using Alternative.me API for Fear & Greed Index
      const response = await fetch('https://api.alternative.me/fng/')
      const result = await response.json()
      
      if (result.data && result.data.length > 0) {
        setData(result.data[0])
        setLastFetched(new Date()) // Update our last fetch time
        console.log('✅ Fear & Greed Index updated:', result.data[0].value, result.data[0].value_classification)
      }
    } catch (error) {
      console.error('Error fetching Fear & Greed Index:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      // Try different date formats that the API might return
      let date: Date
      
      // First try parsing as is
      date = new Date(timestamp)
      
      // If that fails, try parsing as Unix timestamp
      if (isNaN(date.getTime())) {
        const unixTimestamp = parseInt(timestamp)
        if (!isNaN(unixTimestamp)) {
          date = new Date(unixTimestamp * 1000) // Convert seconds to milliseconds
        } else {
          // If all else fails, use current date
          date = new Date()
        }
      }
      
      return date.toLocaleString()
    } catch (error) {
      console.error('Error parsing timestamp:', error)
      return 'Recently'
    }
  }

  const getFearGreedColor = (value: number) => {
    console.log('🎨 Fear & Greed Index value:', value, 'Color function called')
    if (value >= 0 && value <= 25) return 'text-red-600' // Extreme Fear - brighter red
    if (value >= 26 && value <= 45) return 'text-orange-600' // Fear - brighter orange
    if (value >= 46 && value <= 55) return 'text-yellow-600' // Neutral - brighter yellow
    if (value >= 56 && value <= 75) return 'text-green-600' // Greed - brighter green
    if (value >= 76 && value <= 100) return 'text-green-700' // Extreme Greed - darker green
    return 'text-gray-400'
  }

  const getFearGreedIcon = (value: number) => {
    if (value >= 0 && value <= 25) return <Frown className="w-6 h-6 text-red-600" />
    if (value >= 26 && value <= 45) return <Meh className="w-6 h-6 text-orange-600" />
    if (value >= 46 && value <= 55) return <Meh className="w-6 h-6 text-yellow-600" />
    if (value >= 56 && value <= 75) return <Smile className="w-6 h-6 text-green-600" />
    if (value >= 76 && value <= 100) return <AlertTriangle className="w-6 h-6 text-green-700" />
    return <Meh className="w-6 h-6 text-gray-400" />
  }

  const getFearGreedBackground = (value: number) => {
    if (value >= 0 && value <= 25) return 'bg-red-600/20 border-red-600/40' // Extreme Fear - more visible
    if (value >= 26 && value <= 45) return 'bg-orange-600/20 border-orange-600/40' // Fear - more visible
    if (value >= 46 && value <= 55) return 'bg-yellow-600/20 border-yellow-600/40' // Neutral - more visible
    if (value >= 56 && value <= 75) return 'bg-green-600/20 border-green-600/40' // Greed - more visible
    if (value >= 76 && value <= 100) return 'bg-green-700/20 border-green-700/40' // Extreme Greed - more visible
    return 'bg-gray-500/10 border-gray-500/30'
  }

  const getFearGreedDescription = (value: number) => {
    if (value >= 0 && value <= 25) return 'Extreme Fear - Market sentiment is very negative'
    if (value >= 26 && value <= 45) return 'Fear - Market sentiment is negative'
    if (value >= 46 && value <= 55) return 'Neutral - Market sentiment is balanced'
    if (value >= 56 && value <= 75) return 'Greed - Market sentiment is positive'
    if (value >= 76 && value <= 100) return 'Extreme Greed - Market sentiment is very positive'
    return 'Unknown sentiment'
  }

  if (loading) {
    return (
      <section className="card mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-gold"></div>
        </div>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="card mb-8">
        <div className="text-center py-8">
          <p className="text-gray-400">Unable to load Fear & Greed Index</p>
        </div>
      </section>
    )
  }

  return (
    <section className="card mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-crypto-gold" />
            <h2 className="text-xl font-bold text-white">Crypto Fear & Greed Index</h2>
          </div>
        </div>
        
        <div className={`flex items-center space-x-4 p-4 rounded-lg border ${getFearGreedBackground(data.value)}`}>
          <div className="flex items-center space-x-3">
            {getFearGreedIcon(data.value)}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getFearGreedColor(data.value)}`}>
                {data.value}
              </div>
              <div className="text-sm text-gray-400">
                {data.value_classification}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block border-l border-gray-600 pl-4">
            <p className="text-sm text-gray-300 max-w-xs">
              {getFearGreedDescription(data.value)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Extreme Fear</span>
          <span>Fear</span>
          <span>Neutral</span>
          <span>Greed</span>
          <span>Extreme Greed</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${data.value}%`,
              background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 25%, #ca8a04 50%, #16a34a 75%, #15803d 100%)'
            }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last fetched: {lastFetched.toLocaleString()}
      </div>
    </section>
  )
}

export default FearGreedIndex 