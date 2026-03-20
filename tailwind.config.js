/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          primary: '#1a0b2e',
          secondary: '#2d1b4e',
          accent: '#ffd700',
          gold: '#ffd700',
          green: '#00ff88',
          red: '#ff4757'
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#d1d5db',         // gray-300
            maxWidth: 'none',
            h1: { color: '#ffffff', fontWeight: '700' },
            h2: { color: '#ffffff', fontWeight: '700', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' },
            h3: { color: '#e5e7eb', fontWeight: '600' },
            h4: { color: '#e5e7eb' },
            strong: { color: '#ffffff', fontWeight: '700' },
            a: { color: '#ffd700', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            blockquote: { color: '#9ca3af', borderLeftColor: '#ffd700', borderLeftWidth: '3px', fontStyle: 'italic' },
            code: { color: '#ffd700', backgroundColor: '#1f1035', padding: '2px 6px', borderRadius: '4px', fontWeight: '400' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { backgroundColor: '#0f0720', border: '1px solid #374151', borderRadius: '0.5rem' },
            'pre code': { color: '#e5e7eb', backgroundColor: 'transparent', padding: '0' },
            hr: { borderColor: '#374151' },
            li: { color: '#d1d5db' },
            'ul > li::marker': { color: '#ffd700' },
            'ol > li::marker': { color: '#ffd700' },
            img: { borderRadius: '0.75rem' },
            thead: { borderBottomColor: '#374151' },
            'tbody tr': { borderBottomColor: '#1f2937' },
            th: { color: '#ffffff' },
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 