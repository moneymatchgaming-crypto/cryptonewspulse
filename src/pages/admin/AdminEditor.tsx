import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { BlogApi, BlogPost } from '../../services/blogApi'
import {
  ArrowLeft, Save, Eye, Bold, Italic, Link2, Quote, Code,
  List, Minus, Upload, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true } as any)

const CATEGORIES = ['general', 'bitcoin', 'ethereum', 'defi', 'nft', 'regulation', 'altcoin']

// ── Markdown insertion helper ──────────────────────────────────────────────────
function insertMarkdown(
  el: HTMLTextAreaElement,
  type: string,
  setValue: (val: string) => void,
) {
  const start = el.selectionStart
  const end = el.selectionEnd
  const val = el.value
  const selected = val.substring(start, end)

  let newVal = val
  let newCursor = start

  const wrap = (before: string, after: string, placeholder: string) => {
    if (selected) {
      newVal = val.substring(0, start) + before + selected + after + val.substring(end)
      newCursor = start + before.length + selected.length + after.length
    } else {
      newVal = val.substring(0, start) + before + placeholder + after + val.substring(end)
      newCursor = start + before.length + placeholder.length
    }
  }

  const linePrefix = (prefix: string) => {
    const lineStart = val.lastIndexOf('\n', start - 1) + 1
    newVal = val.substring(0, lineStart) + prefix + val.substring(lineStart)
    newCursor = start + prefix.length
  }

  switch (type) {
    case 'bold':      wrap('**', '**', 'bold text'); break
    case 'italic':    wrap('*', '*', 'italic text'); break
    case 'h2':        linePrefix('## '); break
    case 'h3':        linePrefix('### '); break
    case 'link':
      if (selected) {
        newVal = val.substring(0, start) + `[${selected}](https://)` + val.substring(end)
        newCursor = start + selected.length + 10
      } else {
        newVal = val.substring(0, start) + '[link text](https://)' + val.substring(end)
        newCursor = start + 21
      }
      break
    case 'quote':     linePrefix('> '); break
    case 'code':      wrap('`', '`', 'code'); break
    case 'codeblock':
      if (selected) {
        newVal = val.substring(0, start) + '```\n' + selected + '\n```' + val.substring(end)
        newCursor = start + 4 + selected.length + 4
      } else {
        newVal = val.substring(0, start) + '```\ncode here\n```' + val.substring(end)
        newCursor = start + 4
      }
      break
    case 'image':
      newVal = val.substring(0, start) + '![description](https://image-url.jpg)' + val.substring(end)
      newCursor = start + 37
      break
    case 'list':      linePrefix('- '); break
    case 'hr':
      newVal = val.substring(0, start) + '\n\n---\n\n' + val.substring(end)
      newCursor = start + 7
      break
  }

  setValue(newVal)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(newCursor, newCursor)
  })
}

// ── Toolbar button ─────────────────────────────────────────────────────────────
function TBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
    >
      {children}
    </button>
  )
}

// ── Main editor ────────────────────────────────────────────────────────────────
export default function AdminEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category: 'general',
    published: false,
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    BlogApi.adminGetPost(Number(id))
      .then(post => {
        setForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          cover_image: post.cover_image,
          category: post.category,
          published: Boolean(post.published),
        })
      })
      .catch(() => navigate('/admin'))
      .finally(() => setLoading(false))
  }, [id])

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function uploadCoverImage(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    setUploading(true)
    setError('')
    try {
      const url = await BlogApi.uploadImage(file)
      set('cover_image', url)
    } catch (e: any) {
      setError('Image upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadCoverImage(file)
  }

  function toolbar(type: string) {
    if (textareaRef.current) insertMarkdown(textareaRef.current, type, val => set('content', val))
  }

  async function handleSave(publish?: boolean) {
    setError('')
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required')
      return
    }
    setSaving(true)
    try {
      const data = { ...form, published: publish !== undefined ? publish : form.published }
      if (isEdit) {
        await BlogApi.adminUpdatePost(Number(id), data)
      } else {
        await BlogApi.adminCreatePost(data)
      }
      navigate('/admin')
    } catch (e: any) {
      setError(e.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crypto-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-crypto-primary">

      {/* ── Sticky header ── */}
      <header className="bg-crypto-secondary border-b border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-white font-medium">{isEdit ? 'Edit Post' : 'New Post'}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreview(p => !p)}
            className="flex items-center space-x-1 text-gray-400 hover:text-white border border-gray-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <Eye size={14} />
            <span>{preview ? 'Edit' : 'Preview'}</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="text-gray-300 border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center space-x-1 bg-crypto-gold hover:bg-yellow-500 text-black font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving…' : 'Publish'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-5">

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* ── PREVIEW MODE ── */}
        {preview ? (
          <div className="prose prose-invert max-w-none">
            {form.cover_image && (
              <img src={form.cover_image} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-6" />
            )}
            <h1 className="text-white text-3xl font-bold mb-4">{form.title || 'Untitled'}</h1>
            {form.excerpt && <p className="text-gray-300 text-lg mb-6 italic">{form.excerpt}</p>}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: marked.parse(form.content) as string }}
            />
          </div>

        ) : (
          <>
            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Post title…"
              className="w-full bg-transparent text-white text-3xl font-bold placeholder-gray-600 border-none outline-none"
            />

            {/* Category + published */}
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="bg-crypto-secondary border border-gray-600 text-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-crypto-gold"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>

              <label className="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={e => set('published', e.target.checked)}
                  className="accent-crypto-gold"
                />
                <span>Published</span>
              </label>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-gray-500 text-xs mb-1">Excerpt (shown in listing)</label>
              <textarea
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                rows={2}
                placeholder="Short description of the post…"
                className="w-full bg-crypto-secondary border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-crypto-gold resize-none text-sm"
              />
            </div>

            {/* ── Cover image upload ── */}
            <div>
              <label className="block text-gray-500 text-xs mb-2">Cover image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && uploadCoverImage(e.target.files[0])}
              />

              {form.cover_image ? (
                <div className="relative group">
                  <img
                    src={form.cover_image}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => set('cover_image', '')}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-crypto-gold bg-yellow-900/10'
                      : 'border-gray-600 hover:border-gray-400 bg-crypto-secondary'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-crypto-gold" />
                      <span className="text-sm">Uploading…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload size={24} />
                      <span className="text-sm">
                        Drop an image here or <span className="text-crypto-gold">click to browse</span>
                      </span>
                      <span className="text-xs text-gray-600">JPG, PNG, GIF, WebP · max 10 MB</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Content editor ── */}
            <div>
              <label className="block text-gray-500 text-xs mb-2">Content</label>

              {/* Formatting toolbar */}
              <div className="flex items-center flex-wrap gap-1 bg-crypto-secondary border border-gray-700 rounded-t-xl px-3 py-2 border-b-0">
                <TBtn onClick={() => toolbar('bold')}  title="Bold"><Bold size={14} /></TBtn>
                <TBtn onClick={() => toolbar('italic')} title="Italic"><Italic size={14} /></TBtn>

                <div className="w-px h-5 bg-gray-700 mx-1" />

                <TBtn onClick={() => toolbar('h2')} title="Heading 2">
                  <span className="text-xs font-bold tracking-tight">H2</span>
                </TBtn>
                <TBtn onClick={() => toolbar('h3')} title="Heading 3">
                  <span className="text-xs font-bold tracking-tight">H3</span>
                </TBtn>

                <div className="w-px h-5 bg-gray-700 mx-1" />

                <TBtn onClick={() => toolbar('quote')} title="Blockquote"><Quote size={14} /></TBtn>
                <TBtn onClick={() => toolbar('list')}  title="Bullet list"><List size={14} /></TBtn>
                <TBtn onClick={() => toolbar('hr')}    title="Horizontal divider"><Minus size={14} /></TBtn>

                <div className="w-px h-5 bg-gray-700 mx-1" />

                <TBtn onClick={() => toolbar('code')}      title="Inline code"><Code size={14} /></TBtn>
                <TBtn onClick={() => toolbar('codeblock')} title="Code block">
                  <span className="text-xs font-mono leading-none">{'{ }'}</span>
                </TBtn>

                <div className="w-px h-5 bg-gray-700 mx-1" />

                <TBtn onClick={() => toolbar('link')}  title="Insert link"><Link2 size={14} /></TBtn>
                <TBtn onClick={() => toolbar('image')} title="Insert image URL">
                  <span className="text-xs leading-none">🖼</span>
                </TBtn>
              </div>

              <textarea
                ref={textareaRef}
                value={form.content}
                onChange={e => set('content', e.target.value)}
                rows={24}
                placeholder="Write your post here…"
                className="w-full bg-crypto-secondary border border-gray-700 rounded-b-xl px-5 py-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-crypto-gold resize-y font-mono text-sm leading-relaxed"
              />

              {/* Tips toggle */}
              <button
                onClick={() => setShowTips(t => !t)}
                className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-crypto-gold transition-colors"
              >
                {showTips ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showTips ? 'Hide' : 'Show'} formatting tips & image guide
              </button>

              {/* ── Tips panel ── */}
              {showTips && (
                <div className="mt-3 bg-crypto-secondary border border-gray-700 rounded-xl p-5 text-xs text-gray-400 space-y-6">

                  {/* Markdown cheatsheet */}
                  <div>
                    <h4 className="text-gray-200 font-semibold mb-3 text-sm">Markdown Cheatsheet</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono">
                      <span className="text-gray-500">**bold text**</span>
                      <span className="text-gray-300 font-bold">bold text</span>

                      <span className="text-gray-500">*italic text*</span>
                      <span className="text-gray-300 italic">italic text</span>

                      <span className="text-gray-500">## Heading 2</span>
                      <span className="text-gray-300 text-base font-bold">Heading 2</span>

                      <span className="text-gray-500">### Heading 3</span>
                      <span className="text-gray-300 font-semibold">Heading 3</span>

                      <span className="text-gray-500">[link text](https://url)</span>
                      <span className="text-crypto-gold underline cursor-default">link text</span>

                      <span className="text-gray-500">&gt; blockquote</span>
                      <span className="border-l-2 border-crypto-gold pl-2 text-gray-400">blockquote</span>

                      <span className="text-gray-500">- list item</span>
                      <span className="text-gray-300">• list item</span>

                      <span className="text-gray-500">`inline code`</span>
                      <span className="bg-gray-800 px-1.5 py-0.5 rounded text-yellow-300">inline code</span>

                      <span className="text-gray-500">---</span>
                      <span className="text-gray-300">horizontal divider</span>
                    </div>

                    <div className="mt-3">
                      <p className="text-gray-500 mb-1">Code block:</p>
                      <pre className="bg-gray-900 rounded-lg p-3 text-gray-400 font-mono whitespace-pre">{`\`\`\`\nyour code here\n\`\`\``}</pre>
                    </div>
                  </div>

                  {/* Image in content */}
                  <div>
                    <h4 className="text-gray-200 font-semibold mb-2 text-sm">Adding images inside your post</h4>
                    <p className="mb-2 text-gray-500">Use the 🖼 toolbar button, or type this directly in your content:</p>
                    <pre className="bg-gray-900 rounded-lg p-3 text-yellow-300 font-mono">{'![Description of image](https://image-url.jpg)'}</pre>

                    <p className="mt-4 mb-2 text-gray-400 font-semibold">Free image hosting you can use:</p>
                    <ul className="space-y-1.5 text-gray-500">
                      <li>
                        → <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-crypto-gold hover:underline">imgur.com</a>
                        {' '}— Upload your image, then right-click it → "Copy image address"
                      </li>
                      <li>
                        → <a href="https://postimages.org" target="_blank" rel="noreferrer" className="text-crypto-gold hover:underline">postimages.org</a>
                        {' '}— Upload and copy the "Direct link"
                      </li>
                      <li>
                        → <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-crypto-gold hover:underline">cloudinary.com</a>
                        {' '}— Free CDN, best for production use
                      </li>
                      <li>→ Any URL ending in <span className="text-gray-400">.jpg .png .gif .webp</span> works</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
