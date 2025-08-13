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
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)'
      },
      colors: {
        brand: {
          from: 'var(--color-brand-from)',
          via: 'var(--color-brand-via)',
          to: 'var(--color-brand-to)'
        },
        primary: {
          DEFAULT: 'var(--color-primary, var(--color-primary-600, #386BFF))',
          500: 'var(--color-primary-500, #5B8CFF)',
          600: 'var(--color-primary-600, #386BFF)'
        },
        'primary-foreground': 'var(--color-primary-foreground, #ffffff)',
        accent: 'var(--color-accent, #ec4899)',
        'accent-foreground': 'var(--color-accent-foreground, #ffffff)',
        secondary: 'var(--color-secondary, rgba(254,252,232,1))',
        'secondary-foreground': 'var(--color-secondary-foreground, #0D172E)',
        card: 'var(--color-card, rgba(255,255,255,0.9))',
        'card-foreground': 'var(--color-card-foreground, #0D172E)',
        popover: 'var(--color-popover, #ffffff)',
        'popover-foreground': 'var(--color-popover-foreground, #0D172E)',
        border: 'var(--color-border, rgba(13, 24, 46, 0.06))',
        background: 'var(--color-background, rgba(255,255,255,0.9))',
        foreground: 'var(--color-foreground, #0D172E)',
        muted: 'var(--color-muted, #657085)',
        'muted-foreground': 'var(--color-muted-foreground, #657085)',
        input: 'var(--color-input, #e5e7eb)',
        ring: 'var(--color-ring, #386BFF)',
        success: 'var(--color-success, #10B981)',
        warning: 'var(--color-warning, #F59E0B)',
        danger: 'var(--color-danger, #EF4444)'
      },
      boxShadow: {
        xl: '0 8px 30px rgba(0,0,0,0.12)'
      }
    }
  },
  plugins: [animate]
}

export default config

