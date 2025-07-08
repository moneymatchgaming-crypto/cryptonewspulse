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
          primary: '#1a0b2e',      // Rich dark purple background
          secondary: '#2d1b4e',    // Medium purple for cards
          accent: '#ffd700',       // Gold accent (keeping your existing gold)
          gold: '#ffd700',         // Gold for highlights
          green: '#00ff88',        // Keep existing green for positive changes
          red: '#ff4757'           // Keep existing red for negative changes
        }
      }
    },
  },
  plugins: [],
} 