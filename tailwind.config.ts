import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          from: 'var(--color-brand-from)',
          via: 'var(--color-brand-via)',
          to: 'var(--color-brand-to)'
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '2rem'
      },
      boxShadow: {
        xl: '0 8px 30px rgba(0,0,0,0.12)'
      }
    }
  },
  plugins: []
}

export default config

