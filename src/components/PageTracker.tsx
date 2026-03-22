import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare function gtag(...args: unknown[]): void

export default function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    if (typeof gtag === 'undefined') return
    gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location])

  return null
}
