import { useEffect } from 'react'

interface StructuredDataProps {
  type: 'website' | 'news' | 'organization'
  title?: string
  description?: string
  url?: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
}

const StructuredData = ({ 
  type, 
  title = "CryptoNewsPulse - Real-time Cryptocurrency News & Market Data",
  description = "Stay updated with the latest cryptocurrency news, real-time market data, Bitcoin dominance, and Fear & Greed index.",
  url = "https://cryptonewspulse.xyz",
  image = "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=630&fit=crop",
  publishedTime,
  modifiedTime
}: StructuredDataProps) => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'news' ? 'NewsArticle' : type === 'organization' ? 'Organization' : 'WebSite',
      "name": title,
      "description": description,
      "url": url,
      "image": image,
      ...(type === 'news' && publishedTime && {
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "publisher": {
          "@type": "Organization",
          "name": "CryptoNewsPulse",
          "logo": {
            "@type": "ImageObject",
            "url": "https://cryptonewspulse.xyz/logo.png"
          }
        }
      }),
      ...(type === 'organization' && {
        "logo": "https://cryptonewspulse.xyz/logo.png",
        "sameAs": [
          "https://twitter.com/cryptonewspulse",
          "https://github.com/cryptonewspulse"
        ]
      })
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [type, title, description, url, image, publishedTime, modifiedTime])

  return null
}

export default StructuredData 