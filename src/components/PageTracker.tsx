import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare function gtag(...args: unknown[]): void

const SITE_URL = 'https://cryptonewspulse.xyz'

export default function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // Update canonical tag so every page gets its own canonical URL (not the homepage)
    const canonical = document.getElementById('canonical-tag') as HTMLLinkElement
    if (canonical) canonical.href = `${SITE_URL}${location.pathname}`

    // Fire GA4 page_view on every client-side navigation
    if (typeof gtag === 'undefined') return
    gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location])

  return null
}
