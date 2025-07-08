import { TrendingUp, TrendingDown } from 'lucide-react'
import { CryptoPrice } from '../types'
import BitcoinDominance from './BitcoinDominance'

interface CryptoPricesProps {
  prices: CryptoPrice[]
  refreshKey?: number
}

const CryptoPrices = ({ prices, refreshKey }: CryptoPricesProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    }
    return `$${marketCap.toLocaleString()}`
  }

  if (prices.length === 0) {
    return (
      <section className="card">
        <h2 className="text-2xl font-bold mb-6 text-crypto-gold">Market Overview</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="card">
      <h2 className="text-2xl font-bold mb-6 text-crypto-gold">Market Overview</h2>
      
      {/* Bitcoin Dominance Chart */}
      <div className="mb-6">
        <BitcoinDominance refreshKey={refreshKey} />
      </div>
      
      {/* Crypto Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prices.map((crypto) => (
          <div key={crypto.id} className="bg-crypto-primary rounded-lg p-4 border border-crypto-accent/20">
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={crypto.image} 
                alt={crypto.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-white">{crypto.name}</h3>
                <p className="text-gray-400 text-sm">{crypto.symbol.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-bold text-white">
                {formatPrice(crypto.current_price)}
              </p>
              
              <div className="flex items-center space-x-2">
                {crypto.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-crypto-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-crypto-red" />
                )}
                <span 
                  className={`text-sm font-medium ${
                    crypto.price_change_percentage_24h >= 0 
                      ? 'text-crypto-green' 
                      : 'text-crypto-red'
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              
              <p className="text-gray-400 text-sm">
                Market Cap: {formatMarketCap(crypto.market_cap)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CryptoPrices 