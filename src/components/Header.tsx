import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface HeaderProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

const Header = ({ selectedFilter, onFilterChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  const filters = [
    { id: 'all', name: 'All News' },
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'defi', name: 'DeFi' },
    { id: 'nft', name: 'NFTs' },
    { id: 'regulation', name: 'Regulation' },
    { id: 'general', name: 'General' }
  ]

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-gradient-to-r from-crypto-primary to-crypto-secondary border-b border-crypto-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src="/logo.png"
                alt="CryptoNewsPulse"
                className="h-44 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center">
            {isHome && filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? 'bg-crypto-accent text-gray-900 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-crypto-secondary/50'
                }`}
              >
                {filter.name}
              </button>
            ))}
            <Link
              to="/blog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith('/blog')
                  ? 'bg-crypto-accent text-gray-900 shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-crypto-secondary/50'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === filter.id
                      ? 'bg-crypto-accent text-gray-900 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-crypto-secondary/50'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 