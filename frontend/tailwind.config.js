/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Chakra Petch"', 'monospace'],
        mono:    ['"Space Mono"',   'monospace'],
      },
      colors: {
        void:   '#070b14',
        panel:  '#0d1424',
        card:   '#111827',
        border: '#1e2d47',
        dim:    '#1a2540',
        cyan:   { DEFAULT: '#00e5ff', dark: '#0097a7' },
        amber:  { DEFAULT: '#ffb300', dark: '#e65100' },
        rose:   { DEFAULT: '#ff4757', dark: '#c0392b' },
        emerald:{ DEFAULT: '#00e676', dark: '#00695c' },
        violet: { DEFAULT: '#7c3aed', dark: '#4c1d95' },
        text:   { primary: '#e2eaf8', secondary: '#8899bb', muted: '#4a5c7a' },
      },
      boxShadow: {
        cyan:   '0 0 20px rgba(0,229,255,0.15)',
        amber:  '0 0 20px rgba(255,179,0,0.15)',
        rose:   '0 0 20px rgba(255,71,87,0.15)',
        panel:  '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan-line':  'scanLine 4s linear infinite',
        'glow-cyan':  'glowCyan 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanLine:  { '0%': { top: '0%' }, '100%': { top: '100%' } },
        glowCyan:  {
          '0%':   { boxShadow: '0 0 5px rgba(0,229,255,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0,229,255,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
