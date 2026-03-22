import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import BlogList from './pages/BlogList.tsx'
import BlogPost from './pages/BlogPost.tsx'
import AdminLogin from './pages/admin/AdminLogin.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminEditor from './pages/admin/AdminEditor.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import PageTracker from './components/PageTracker.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PageTracker />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/posts/new" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
        <Route path="/admin/posts/:id/edit" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
