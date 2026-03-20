import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BlogApi, BlogPost } from '../services/blogApi'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Calendar, Tag } from 'lucide-react'

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadPosts(page)
  }, [page])

  async function loadPosts(p: number) {
    setLoading(true)
    try {
      const data = await BlogApi.listPosts(p)
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crypto-primary flex flex-col">
      <Header selectedFilter="all" onFilterChange={() => {}} />

      <main className="container mx-auto px-4 py-10 flex-grow max-w-4xl">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold">Blog</h1>
          <p className="text-gray-400 mt-1">Original analysis and insights from CryptoNewsPulse</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-gold" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No posts published yet. Check back soon!</p>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block bg-crypto-secondary rounded-xl border border-gray-700 hover:border-crypto-gold/50 transition-colors overflow-hidden group"
                >
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center space-x-1">
                        <Tag size={11} />
                        <span className="capitalize">{post.category}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar size={11} />
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}</span>
                      </span>
                    </div>
                    <h2 className="text-white text-xl font-bold group-hover:text-crypto-gold transition-colors mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                    )}
                    <span className="inline-block mt-3 text-crypto-gold text-sm hover:underline">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-3 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-crypto-secondary border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 transition-colors text-sm"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-400 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-crypto-secondary border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 transition-colors text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
