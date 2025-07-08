

const About = () => {
  return (
    <div className="min-h-screen bg-crypto-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-crypto-secondary rounded-lg p-8">
          <h1 className="text-3xl font-bold text-crypto-gold mb-8">About Crypto News Pulse</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Our Mission</h2>
              <p className="text-lg">
                Crypto News Pulse is dedicated to providing cryptocurrency enthusiasts, investors, and professionals with the most comprehensive, real-time, and reliable cryptocurrency news aggregation platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">What We Do</h2>
              <p>Crypto News Pulse aggregates news from over 30 trusted cryptocurrency and blockchain news sources, providing you with:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                <li><strong className="text-white">Real-time News Aggregation:</strong> Latest updates from top crypto news sources</li>
                <li><strong className="text-white">Live Market Data:</strong> Real-time cryptocurrency prices and market indicators</li>
                <li><strong className="text-white">Market Sentiment:</strong> Bitcoin dominance and Fear & Greed index tracking</li>
                <li><strong className="text-white">Smart Categorization:</strong> News filtered by Bitcoin, Ethereum, DeFi, NFTs, and more</li>
                <li><strong className="text-white">Fast Loading:</strong> Optimized performance with intelligent caching</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Our Sources</h2>
              <p>We aggregate content from leading cryptocurrency news sources including:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-1">
                  <p className="font-medium text-white">Major News Outlets:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>CoinTelegraph</li>
                    <li>CoinDesk</li>
                    <li>Decrypt</li>
                    <li>The Block</li>
                    <li>NewsBTC</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-white">Specialized Sources:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>AMBCrypto</li>
                    <li>CryptoSlate</li>
                    <li>The Defiant</li>
                    <li>DeFi Rate</li>
                    <li>Bitcoin Magazine</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Technology</h2>
              <p>Crypto News Pulse is built with modern web technologies:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-3">
                <li><strong className="text-white">Frontend:</strong> React, TypeScript, Tailwind CSS</li>
                <li><strong className="text-white">Backend:</strong> Node.js, Express</li>
                <li><strong className="text-white">Data Sources:</strong> RSS feeds, CoinGecko API, Alternative.me API</li>
                <li><strong className="text-white">Performance:</strong> Intelligent caching, parallel processing, optimized loading</li>
                <li><strong className="text-white">Mobile:</strong> Responsive design, PWA capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Why Choose Crypto News Pulse?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                <div className="p-4 bg-crypto-primary rounded-lg">
                  <h3 className="font-semibold text-crypto-gold mb-2">⚡ Speed & Efficiency</h3>
                  <p className="text-sm">Fast loading times with intelligent caching and parallel RSS feed processing.</p>
                </div>
                <div className="p-4 bg-crypto-primary rounded-lg">
                  <h3 className="font-semibold text-crypto-gold mb-2">📊 Comprehensive Data</h3>
                  <p className="text-sm">Real-time prices, market indicators, and news from 30+ sources in one place.</p>
                </div>
                <div className="p-4 bg-crypto-primary rounded-lg">
                  <h3 className="font-semibold text-crypto-gold mb-2">🎯 Smart Filtering</h3>
                  <p className="text-sm">Filter news by category: Bitcoin, Ethereum, DeFi, NFTs, Regulation, and more.</p>
                </div>
                <div className="p-4 bg-crypto-primary rounded-lg">
                  <h3 className="font-semibold text-crypto-gold mb-2">📱 Mobile Optimized</h3>
                  <p className="text-sm">Responsive design that works perfectly on desktop, tablet, and mobile devices.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Our Commitment</h2>
              <p>Crypto News Pulse is committed to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-3">
                <li>Providing accurate and timely cryptocurrency news</li>
                <li>Maintaining high performance and reliability</li>
                <li>Protecting user privacy and data security</li>
                <li>Continuously improving our platform and features</li>
                <li>Supporting the cryptocurrency and blockchain community</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Disclaimer</h2>
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm">
                  <strong className="text-yellow-400">Important:</strong> Crypto News Pulse provides news aggregation and market data for informational purposes only. We do not provide financial advice, and the information on this site should not be considered as investment recommendations. Cryptocurrency investments carry significant risks. Always conduct your own research and consult with qualified financial advisors before making investment decisions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Contact Us</h2>
              <p>Have questions, suggestions, or feedback? We'd love to hear from you:</p>
              <div className="mt-3 p-4 bg-crypto-primary rounded-lg">
                <p><strong>General Inquiries:</strong> hello@cryptonewspulse.xyz</p>
                <p><strong>Technical Support:</strong> support@cryptonewspulse.xyz</p>
                <p><strong>Business Inquiries:</strong> business@cryptonewspulse.xyz</p>
                <p><strong>Website:</strong> cryptonewspulse.xyz</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-crypto-accent/20">
              <a 
                href="/" 
                className="text-crypto-gold hover:text-yellow-400 transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About 