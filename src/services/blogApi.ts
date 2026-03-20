const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Public blog posts are served as static JSON files from public/content/posts/.
// Vite copies public/ into dist/ at build time, so Vercel serves them with no
// backend required. This means the public blog works on the live site even
// though the Express server is only ever run locally.
const STATIC_BASE = '/content/posts'

function authHeaders() {
  const token = localStorage.getItem('cnp_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  published: number
  created_at: string
  updated_at: string
}

export interface BlogListResult {
  posts: BlogPost[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const BlogApi = {
  // ── Public routes — fetch static JSON directly (no backend needed) ─────────
  async listPosts(page = 1, category?: string): Promise<BlogListResult> {
    const r = await fetch(`${STATIC_BASE}/_index.json`)
    if (!r.ok) return { posts: [], total: 0, page, limit: 10, totalPages: 0 }

    let posts: BlogPost[] = await r.json()
    if (category) posts = posts.filter(p => p.category === category)

    const total = posts.length
    const limit = 10
    const paged = posts.slice((page - 1) * limit, page * limit)
    return { posts: paged, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getPost(slug: string): Promise<BlogPost> {
    const r = await fetch(`${STATIC_BASE}/${slug}.json`)
    if (!r.ok) throw new Error('Post not found')
    return r.json()
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  async login(username: string, password: string) {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!r.ok) throw new Error('Invalid credentials')
    return r.json()
  },

  // ── Admin routes — always use the local backend ────────────────────────────
  async adminListPosts(): Promise<BlogPost[]> {
    const r = await fetch(`${BASE}/api/admin/posts`, { headers: authHeaders() })
    if (!r.ok) throw new Error('Unauthorized')
    return r.json()
  },

  async adminGetPost(id: number): Promise<BlogPost> {
    const r = await fetch(`${BASE}/api/admin/posts/${id}`, { headers: authHeaders() })
    if (!r.ok) throw new Error('Not found')
    return r.json()
  },

  async adminCreatePost(data: Partial<BlogPost>): Promise<BlogPost> {
    const r = await fetch(`${BASE}/api/admin/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!r.ok) throw new Error('Failed to create post')
    return r.json()
  },

  async adminUpdatePost(id: number, data: Partial<BlogPost>): Promise<BlogPost> {
    const r = await fetch(`${BASE}/api/admin/posts/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!r.ok) throw new Error('Failed to update post')
    return r.json()
  },

  async adminDeletePost(id: number): Promise<void> {
    const r = await fetch(`${BASE}/api/admin/posts/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!r.ok) throw new Error('Failed to delete post')
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    const token = localStorage.getItem('cnp_admin_token')
    const r = await fetch(`${BASE}/api/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!r.ok) throw new Error('Upload failed')
    const data = await r.json()
    return data.url  // already an absolute path like /images/blog/filename.jpg
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const r = await fetch(`${BASE}/api/admin/change-password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!r.ok) throw new Error('Failed to change password')
    return r.json()
  },

  async publishSite(message?: string): Promise<{ success: boolean; message: string }> {
    const r = await fetch(`${BASE}/api/admin/publish`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message: message || `Blog update ${new Date().toISOString().slice(0, 10)}` }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Publish failed')
    return data
  },
}
