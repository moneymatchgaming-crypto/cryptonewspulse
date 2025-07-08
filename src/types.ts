export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  category: 'bitcoin' | 'ethereum' | 'defi' | 'nft' | 'regulation' | 'general'
}

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

export interface NewsCategory {
  id: string
  name: string
  label: string
} 