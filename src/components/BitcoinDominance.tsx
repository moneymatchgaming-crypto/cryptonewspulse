import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Bitcoin } from 'lucide-react'
import { ApiService } from '../services/api'

interface BitcoinDominanceProps {
  refreshKey?: number
}

const BitcoinDominance = ({ refreshKey }: BitcoinDominanceProps) => {
  const [dominance, setDominance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState<Date>(new Date())

  useEffect(() => {
    fetchBitcoinDominance()
  }, [refreshKey])

  const fetchBitcoinDominance = async () => {
    try {
      setLoading(true)
      const dominanceData = await ApiService.getBitcoinDominance()
      setDominance(dominanceData)
      setLastFetched(new Date())
    } catch (error) {
      console.error('Error fetching Bitcoin dominance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDominanceColor = (value: number) => {
    if (value >= 50) return 'text-crypto-gold' // High dominance
    if (value >= 40) return 'text-orange-400' // Medium-high
    if (value >= 30) return 'text-yellow-400' // Medium
    return 'text-crypto-green' // Low dominance
  }

  const getDominanceBackground = (value: number) => {
    if (value >= 50) return 'bg-crypto-gold/10 border-crypto-gold/30'
    if (value >= 40) return 'bg-orange-500/10 border-orange-500/30'
    if (value >= 30) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-crypto-green/10 border-crypto-green/30'
  }

  const getDominanceDescription = (value: number) => {
    if (value >= 50) return 'Bitcoin has strong market dominance'
    if (value >= 40) return 'Bitcoin maintains significant market share'
    if (value >= 30) return 'Bitcoin has moderate market influence'
    return 'Bitcoin dominance is relatively low'
  }

  if (loading) {
    return (
      <div className="bg-crypto-primary rounded-lg p-4 border border-crypto-accent/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-gold"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-crypto-primary rounded-lg p-4 border ${getDominanceBackground(dominance)}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Bitcoin className="w-6 h-6 text-crypto-gold" />
        <div>
          <h3 className="font-semibold text-white">Bitcoin Dominance</h3>
          <p className="text-gray-400 text-sm">Market share of total crypto market cap</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Dominance Value */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getDominanceColor(dominance)}`}>
            {dominance.toFixed(2)}%
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {getDominanceDescription(dominance)}
          </p>
        </div>

        {/* Visual Chart */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${dominance}%`,
                background: `linear-gradient(90deg, 
                  ${dominance >= 50 ? '#fbbf24' : dominance >= 40 ? '#f97316' : dominance >= 30 ? '#eab308' : '#00ff88'}, 
                  ${dominance >= 50 ? '#f59e0b' : dominance >= 40 ? '#ea580c' : dominance >= 30 ? '#ca8a04' : '#00cc6a'})`
              }}
            ></div>
          </div>
        </div>

        {/* Market Context */}
        <div className="text-xs text-gray-500 text-center">
          <p>Last updated: {lastFetched.toLocaleTimeString()}</p>
          <p className="mt-1">
            {dominance >= 50 ? 'Bitcoin leads the market' : 
             dominance >= 40 ? 'Bitcoin has strong presence' : 
             dominance >= 30 ? 'Bitcoin maintains influence' : 
             'Altcoins gaining ground'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BitcoinDominance 