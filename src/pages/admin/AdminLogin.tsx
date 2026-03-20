import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BlogApi } from '../../services/blogApi'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await BlogApi.login(username, password)
      localStorage.setItem('cnp_admin_token', token)
      navigate('/admin')
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crypto-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-crypto-gold text-3xl font-bold mb-1">CNP</div>
          <h1 className="text-white text-xl font-semibold">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">CryptoNewsPulse content management</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-crypto-secondary rounded-xl p-6 space-y-4 border border-gray-700"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full bg-crypto-primary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-crypto-gold"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-crypto-primary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-crypto-gold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crypto-gold hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          <a href="/" className="hover:text-gray-400 transition-colors">← Back to site</a>
        </p>
      </div>
    </div>
  )
}
