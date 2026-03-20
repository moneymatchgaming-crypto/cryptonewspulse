import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BlogApi, BlogPost as Post } from '../services/blogApi'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import { marked } from 'marked'

// Configure marked for safe, clean output
marked.setOptions({ breaks: true, gfm: true } as any)

function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    BlogApi.getPost(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen bg-crypto-primary flex flex-col">
      <Header selectedFilter="all" onFilterChange={() => {}} />

      <main className="container mx-auto px-4 py-10 flex-grow max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-gold" />
          </div>
        ) : notFound || !post ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">Post not found.</p>
            <Link to="/blog" className="text-crypto-gold hover:underline">← Back to Blog</Link>
          </div>
        ) : (
          <article>
            <Link to="/blog" className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
              <ArrowLeft size={14} />
              <span>Back to Blog</span>
            </Link>

            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-64 object-cover rounded-xl mb-8"
              />
            )}

            <div className="flex items-center space-x-3 text-xs text-gray-500 mb-4">
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

            <h1 className="text-white text-3xl font-bold leading-tight mb-4">{post.title}</h1>

            {post.excerpt && (
              <p className="text-gray-300 text-lg italic border-l-2 border-crypto-gold pl-4 mb-8">
                {post.excerpt}
              </p>
            )}

            <div
              className="prose prose-invert prose-gold max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            <div className="mt-12 pt-6 border-t border-gray-700">
              <Link to="/blog" className="text-crypto-gold hover:underline text-sm">
                ← More articles
              </Link>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
