/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050506',
        surface: {
          DEFAULT: '#0B0B0D',
          elevated: '#121214',
        },
        card: {
          start: '#0F0F12',
          end: '#070709',
        },
        primary: {
          DEFAULT: '#E10600',
          hover: '#FF2A2A',
          deep: '#8B0000',
          bright: '#FF2A2A',
        },
        silver: {
          DEFAULT: '#C0C0C0',
          heading: '#E8E8EC',
          muted: '#8A8A92',
          border: 'rgba(192, 192, 192, 0.12)',
        },
        muted: '#8A8A92',
        input: {
          bg: 'rgba(15, 15, 18, 0.65)',
          border: 'rgba(192, 192, 192, 0.15)',
        },
        error: '#E10600',
        danger: '#E10600',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['28px', { lineHeight: '36px' }],
        '2xl': ['40px', { lineHeight: '48px' }],
        '3xl': ['56px', { lineHeight: '64px' }],
      },
      boxShadow: {
        'red-glow': '0 0 25px rgba(225, 6, 0, 0.45)',
        'red-glow-sm': '0 0 12px rgba(225, 6, 0, 0.35)',
        'red-glow-lg': '0 0 45px rgba(225, 6, 0, 0.55)',
        'silver-glow': '0 0 20px rgba(192, 192, 192, 0.25)',
        'card-glow': '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(225, 6, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'input-focus': '0 0 0 2px rgba(225, 6, 0, 0.3), 0 0 16px rgba(255, 42, 42, 0.35)',
      },
      borderRadius: {
        'card': '16px',
        'field': '10px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sheen': 'sheen 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(225, 6, 0, 0.8))' },
          '50%': { opacity: '0.4', filter: 'drop-shadow(0 0 2px rgba(225, 6, 0, 0.2))' },
        },
        sheen: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
