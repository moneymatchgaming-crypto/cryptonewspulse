# CryptoNewsPulse.xyz 🚀

Real-time cryptocurrency news aggregation with live market data, Bitcoin dominance tracking, and Fear & Greed index monitoring.

## ✨ Features

- **📰 Real-time News**: Aggregated from 30+ trusted crypto news sources
- **⚡ Smart Caching**: 5-minute news cache, 2-minute market data cache
- **📊 Market Data**: Live crypto prices, Bitcoin dominance, Fear & Greed index
- **🔄 Auto-refresh**: News updates every 8 minutes, prices every 2 minutes
- **📱 Responsive**: Mobile-first design with Tailwind CSS
- **🚀 Fast Loading**: Optimized with caching and parallel processing
- **🛡️ Fallback System**: Graceful degradation when APIs are unavailable

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + RSS aggregation
- **Caching**: In-memory caching with background refresh
- **APIs**: CoinGecko, Alternative.me, RSS feeds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cryptonewspulse.git
cd cryptonewspulse
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Start development servers**
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🌐 Production Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

3. **Set environment variables**
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_NAME=CryptoNewsPulse
```

### Backend Deployment (Railway/Render)

1. **Deploy to Railway**
```bash
# Connect your GitHub repo to Railway
# Railway will auto-detect Node.js and deploy
```

2. **Set environment variables**
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://cryptonewspulse.xyz
```

### Domain Configuration

1. **Purchase domain**: cryptonewspulse.xyz
2. **Configure DNS**:
   - Frontend: `@` → Vercel/Netlify
   - Backend: `api` → Railway/Render
3. **Update environment variables**:
   - `VITE_API_BASE_URL=https://api.cryptonewspulse.xyz`
   - `CORS_ORIGIN=https://cryptonewspulse.xyz`

## 📊 API Endpoints

### News & Content
- `GET /api/news` - Get cached news articles
- `GET /api/cache-status` - Check cache status

### Market Data
- `GET /api/crypto-prices` - Get crypto prices (cached)
- `GET /api/bitcoin-dominance` - Get BTC dominance (cached)
- `GET /api/fear-greed` - Get Fear & Greed index (cached)

### Health & Monitoring
- `GET /health` - Health check endpoint

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001` |
| `PORT` | Backend port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |

### RSS Feed Configuration

The application aggregates news from 30+ RSS feeds. Feeds are automatically cached and refreshed in the background. Failed feeds are gracefully handled with fallback mechanisms.

## 📈 Performance Features

- **Parallel Processing**: 10 concurrent RSS feed requests
- **Timeout Protection**: 5-second timeout per feed
- **Smart Caching**: 5-minute news cache, 2-minute market data cache
- **Background Refresh**: Non-blocking cache updates
- **Error Handling**: Graceful degradation on API failures

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start frontend dev server
npm run server       # Start backend server
npm run server:dev   # Start backend with nodemon
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy:check # Pre-deployment checks
```

### Project Structure

```
crypto-news/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   └── types.ts        # TypeScript types
├── server.cjs          # Backend server
├── env.example         # Environment template
└── README.md          # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cryptonewspulse/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/cryptonewspulse/wiki)

## 🚀 Roadmap

- [ ] User accounts and preferences
- [ ] Push notifications
- [ ] Advanced filtering
- [ ] Portfolio tracking
- [ ] Social features
- [ ] Mobile app

---

Built with ❤️ by the CryptoNewsPulse team 