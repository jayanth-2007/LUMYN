/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#08080D',
          card: '#11111B',
          surface: '#191927',
          border: '#232334',
          hover: '#1B1B29',
          sidebar: '#0B0B12',
        },
        brand: {
          violet: '#8B5CF6',
          'violet-light': '#A78BFA',
          'violet-dark': '#6D28D9',
          cyan: '#22D3EE',
          'cyan-light': '#67E8F9',
          'cyan-dark': '#0891B2',
        },
        lumyn: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 32px -4px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 30px -5px rgba(34, 211, 238, 0.25)',
        'glow-btn': '0 0 24px -2px rgba(139, 92, 246, 0.45)',
        'card-dark': '0 4px 24px -4px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
