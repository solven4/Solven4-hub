/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // OPIOM Core (kept for backward compat)
        gold:    { DEFAULT: '#D4A843', light: '#E8C56A', dark: '#B8892E' },
        opiom:   { bg: '#03080F', surface: '#0B1220', border: '#1A2540', muted: '#8899B4' },
        // Door Colors
        pulse:   { DEFAULT: '#3B82F6', dim: '#3B82F622' },
        network: { DEFAULT: '#D4A843', dim: '#D4A84322' },
        ascend:  { DEFAULT: '#10B981', dim: '#10B98122' },
        command: { DEFAULT: '#8B5CF6', dim: '#8B5CF622' },
        // Status
        fire:    '#F97316',
        danger:  '#EF4444',
        success: '#10B981',
        // SOLVEN4 Design Tokens
        s4: {
          bg:      '#03080F',
          surface: '#0B1220',
          border:  '#1A2540',
          muted:   '#8899B4',
          hub:     '#6366F1',
          edge:    '#3B82F6',
          forge:   '#D4A843',
          oracle:  '#10B981',
          nexus:   '#8B5CF6',
          gold:    '#D4A843',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body:    ["'Exo 2'", 'sans-serif'],
        arabic:  ["'IBM Plex Sans Arabic'", 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'heartbeat':   'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGold:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(212,168,67,0)' }, '50%': { boxShadow: '0 0 0 8px rgba(212,168,67,0.15)' } },
        heartbeat:  { '0%,100%': { transform: 'scale(1)' }, '14%': { transform: 'scale(1.05)' }, '28%': { transform: 'scale(1)' }, '42%': { transform: 'scale(1.03)' }, '70%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
