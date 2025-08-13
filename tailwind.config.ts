import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}'
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          from: 'var(--color-brand-from)',
          via: 'var(--color-brand-via)',
          to: 'var(--color-brand-to)'
        },
        primary: {
          DEFAULT: 'var(--color-primary-600, #386BFF)',
          500: 'var(--color-primary-500, #5B8CFF)',
          600: 'var(--color-primary-600, #386BFF)'
        },
        border: 'var(--color-outline, rgba(13, 24, 46, 0.06))',
        background: 'var(--color-surface, rgba(255,255,255,0.9))',
        foreground: 'var(--color-text, #0D172E)',
        muted: 'var(--color-muted, #657085)',
        success: 'var(--color-success, #10B981)',
        warning: 'var(--color-warning, #F59E0B)',
        danger: 'var(--color-danger, #EF4444)'
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
  plugins: [animate]
}

export default config

