/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'md:grid-cols-2',
    'sm:grid-cols-2',
    'sm:grid-cols-3',
    'sm:table-cell',
    'sm:col-span-2',
    'md:hidden',
    'md:flex-row',
  ],
  theme: {
    extend: {
      colors: {
        wired: {
          bg: '#0a0a0a',
          panel: '#1a1a2e',
          'panel-alt': '#111118',
          neon: '#39ff14',
          'neon-dim': '#2acc0e',
          amber: '#ffbf00',
          dim: '#2a2a3e',
          'dim-light': '#3a3a4e',
          danger: '#ff3333',
          cyan: '#00fff7',
          purple: '#b44aff',
          'dark-green': '#0d3b0d',
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 10px #39ff14, 0 0 20px rgba(57,255,20,0.3)',
        'neon-sm': '0 0 5px #39ff14, 0 0 10px rgba(57,255,20,0.2)',
        'neon-lg': '0 0 15px #39ff14, 0 0 30px rgba(57,255,20,0.4), 0 0 60px rgba(57,255,20,0.1)',
        'amber': '0 0 10px #ffbf00, 0 0 20px rgba(255,191,0,0.3)',
        'inner-neon': 'inset 0 0 10px rgba(57,255,20,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink-caret': 'blink-caret 0.75s step-end infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #39ff14, 0 0 10px #39ff14' },
          '100%': { textShadow: '0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 40px #39ff14' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#39ff14' },
        },
        'matrix-rain': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
};