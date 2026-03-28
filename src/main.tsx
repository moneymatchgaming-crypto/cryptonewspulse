import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import BlogList from './pages/BlogList.tsx'
import BlogPost from './pages/BlogPost.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import PageTracker from './components/PageTracker.tsx'
import './index.css'

// Lazy-load admin routes — keeps them out of the main bundle so homepage
// visitors don't download code they'll never use (~200KB saved)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.tsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.tsx'))
const AdminEditor = lazy(() => import('./pages/admin/AdminEditor.tsx'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PageTracker />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/posts/new" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/admin/posts/:id/edit" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
