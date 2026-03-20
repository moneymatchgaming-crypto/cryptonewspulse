import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BlogApi, BlogPost } from '../../services/blogApi'
import { PenSquare, Trash2, Plus, LogOut, Eye, EyeOff, Upload, CheckCircle, AlertCircle } from 'lucide-react'

type PublishStatus = 'idle' | 'publishing' | 'success' | 'error'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle')
  const [publishMessage, setPublishMessage] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      const data = await BlogApi.adminListPosts()
      setPosts(data)
    } catch {
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function togglePublish(post: BlogPost) {
    try {
      await BlogApi.adminUpdatePost(post.id, { published: post.published ? 0 : 1 })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: p.published ? 0 : 1 } : p))
    } catch (e) {
      alert('Failed to update post')
    }
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setDeleting(post.id)
    try {
      await BlogApi.adminDeletePost(post.id)
      setPosts(prev => prev.filter(p => p.id !== post.id))
    } catch {
      alert('Failed to delete post')
    } finally {
      setDeleting(null)
    }
  }

  async function handlePublish() {
    setPublishStatus('publishing')
    setPublishMessage('')
    try {
      const result = await BlogApi.publishSite()
      setPublishMessage(result.message)
      setPublishStatus('success')
      setTimeout(() => setPublishStatus('idle'), 8000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish failed'
      setPublishMessage(msg)
      setPublishStatus('error')
      setTimeout(() => setPublishStatus('idle'), 8000)
    }
  }

  function logout() {
    localStorage.removeItem('cnp_admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-crypto-primary">
      {/* Header */}
      <header className="bg-crypto-secondary border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-crypto-gold font-bold text-xl">CNP</span>
          <span className="text-gray-400 text-sm">Admin</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            View Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Title row + action buttons */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h1 className="text-white text-2xl font-bold">Blog Posts</h1>
          <div className="flex items-center gap-3">
            {/* Publish to Live Site */}
            <button
              onClick={handlePublish}
              disabled={publishStatus === 'publishing'}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 ${
                publishStatus === 'success'
                  ? 'bg-green-700 hover:bg-green-600 text-white'
                  : publishStatus === 'error'
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {publishStatus === 'publishing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Publishing…</span>
                </>
              ) : publishStatus === 'success' ? (
                <>
                  <CheckCircle size={15} />
                  <span>Published!</span>
                </>
              ) : publishStatus === 'error' ? (
                <>
                  <AlertCircle size={15} />
                  <span>Failed</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>Publish to Live Site</span>
                </>
              )}
            </button>

            {/* New Post */}
            <Link
              to="/admin/posts/new"
              className="flex items-center space-x-2 bg-crypto-gold hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Plus size={16} />
              <span>New Post</span>
            </Link>
          </div>
        </div>

        {/* Publish status message */}
        {publishMessage && (publishStatus === 'success' || publishStatus === 'error') && (
          <div className={`mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${
            publishStatus === 'success'
              ? 'bg-green-900/40 border border-green-700 text-green-300'
              : 'bg-red-900/40 border border-red-700 text-red-300'
          }`}>
            {publishStatus === 'success'
              ? <CheckCircle size={15} className="shrink-0 mt-0.5" />
              : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
            <span>{publishMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-gold" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-4">No posts yet.</p>
            <Link to="/admin/posts/new" className="text-crypto-gold hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-crypto-secondary rounded-xl border border-gray-700 px-5 py-4 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? 'bg-green-900/40 text-green-400 border border-green-700'
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{post.category}</span>
                  </div>
                  <h2 className="text-white font-medium truncate">{post.title}</h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-1 ml-4 shrink-0">
                  <button
                    onClick={() => togglePublish(post)}
                    title={post.published ? 'Unpublish' : 'Publish'}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <Link
                    to={`/admin/posts/${post.id}/edit`}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <PenSquare size={16} />
                  </Link>
                  <button
                    onClick={() => deletePost(post)}
                    disabled={deleting === post.id}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
