import { useState, useEffect } from 'react'
import { Info, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface SourceStatus {
  name: string
  count: number
  status: 'loading' | 'success' | 'error'
  error?: string
}

const NewsDebug = () => {
  const [sources, setSources] = useState<SourceStatus[]>([
    { name: 'CryptoPanic', count: 0, status: 'loading' },
    { name: 'CoinGecko', count: 0, status: 'loading' },
    { name: 'CryptoCompare', count: 0, status: 'loading' },
    { name: 'Messari', count: 0, status: 'loading' },
    { name: 'CoinGecko News', count: 0, status: 'loading' },
    { name: 'CryptoSlate', count: 0, status: 'loading' },
    { name: 'RSS Feeds', count: 0, status: 'loading' }
  ])

  useEffect(() => {
    // Listen for console messages to track source status
    const originalLog = console.log
    console.log = (...args) => {
      originalLog(...args)
      
      const message = args.join(' ')
      
      // Update source status based on console messages
      if (message.includes('Total articles from all sources:')) {
        const total = parseInt(message.match(/\d+/)?.[0] || '0')
        console.log('Total articles found:', total)
      }
      
      if (message.includes('RSS:') && message.includes('CryptoPanic:') && message.includes('CoinGecko:') && message.includes('CryptoCompare:') && message.includes('Messari:') && message.includes('CoinGecko News:') && message.includes('CryptoSlate:')) {
        const rssMatch = message.match(/RSS: (\d+)/)
        const cryptopanicMatch = message.match(/CryptoPanic: (\d+)/)
        const coingeckoMatch = message.match(/CoinGecko: (\d+)/)
        const cryptocompareMatch = message.match(/CryptoCompare: (\d+)/)
        const messariMatch = message.match(/Messari: (\d+)/)
        const coingeckoNewsMatch = message.match(/CoinGecko News: (\d+)/)
        const cryptoslateMatch = message.match(/CryptoSlate: (\d+)/)
        
        setSources(prev => prev.map(source => {
          if (source.name === 'RSS Feeds') {
            return { ...source, count: parseInt(rssMatch?.[1] || '0'), status: 'success' }
          }
          if (source.name === 'CryptoPanic') {
            return { ...source, count: parseInt(cryptopanicMatch?.[1] || '0'), status: 'success' }
          }
          if (source.name === 'CoinGecko') {
            return { ...source, count: parseInt(coingeckoMatch?.[1] || '0'), status: 'success' }
          }
          if (source.name === 'CryptoCompare') {
            return { ...source, count: parseInt(cryptocompareMatch?.[1] || '0'), status: 'success' }
          }
          if (source.name === 'Messari') {
            return { ...source, count: parseInt(messariMatch?.[1] || '0'), status: 'success' }
          }
          if (source.name === 'CoinGecko News') {
            return { ...source, count: parseInt(coingeckoNewsMatch?.[1] || '0'), status: 'success' }
          }
          if (source.name === 'CryptoSlate') {
            return { ...source, count: parseInt(cryptoslateMatch?.[1] || '0'), status: 'success' }
          }
          return source
        }))
      }
    }

    return () => {
      console.log = originalLog
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-crypto-green" />
      case 'error':
        return <XCircle className="w-4 h-4 text-crypto-red" />
      case 'loading':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const totalArticles = sources.reduce((sum, source) => sum + source.count, 0)

  return (
    <section className="card mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-crypto-gold" />
        <h3 className="text-lg font-semibold text-white">News Sources Status</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {sources.map((source) => (
          <div key={source.name} className="bg-crypto-primary rounded-lg p-3 border border-crypto-accent/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{source.name}</span>
              {getStatusIcon(source.status)}
            </div>
            <div className="text-2xl font-bold text-crypto-gold">{source.count}</div>
            <div className="text-xs text-gray-400">articles</div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-white">
          Total Articles: <span className="text-crypto-gold">{totalArticles}</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Check browser console (F12) for detailed source information
        </p>
      </div>
    </section>
  )
}

export default NewsDebug 