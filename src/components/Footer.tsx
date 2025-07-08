import { ExternalLink, Mail, Twitter, Github, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-crypto-secondary/30 border-t border-crypto-accent/20 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* News */}
          <div>
            <h3 className="text-lg font-semibold text-crypto-gold mb-4">News</h3>
            <ul className="space-y-2">
              <li>
                <a href="/?filter=all" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  All News
                </a>
              </li>
              <li>
                <a href="/?filter=bitcoin" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Bitcoin News
                </a>
              </li>
              <li>
                <a href="/?filter=ethereum" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Ethereum News
                </a>
              </li>
              <li>
                <a href="/?filter=defi" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  DeFi News
                </a>
              </li>
              <li>
                <a href="/?filter=nft" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  NFT News
                </a>
              </li>
              <li>
                <a href="/?filter=regulation" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Regulation News
                </a>
              </li>
              <li>
                <a href="/?filter=general" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  General News
                </a>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-lg font-semibold text-crypto-gold mb-4">About Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about.html" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  About Crypto News Pulse
                </a>
              </li>
              <li>
                <a href="mailto:hello@cryptonewspulse.xyz" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="mailto:support@cryptonewspulse.xyz" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="mailto:business@cryptonewspulse.xyz" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Business Inquiries
                </a>
              </li>
            </ul>
          </div>



          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold text-crypto-gold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy.html" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms.html" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-crypto-gold transition-colors">
                  Investment Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-crypto-accent/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/favicon.png" alt="Crypto News Pulse" className="h-8 w-8" />
              <span className="text-lg font-bold text-crypto-gold">Crypto News Pulse</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © {currentYear} Crypto News Pulse. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Cryptocurrency news and market data for informed decisions
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 