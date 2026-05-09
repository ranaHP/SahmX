/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        desert: '#a78bfa',
        emeraldx: '#22d3ee',
        ink: '#080c2f'
      },
      boxShadow: {
        glow: '0 0 50px rgba(34, 211, 238, 0.24)',
        gold: '0 0 40px rgba(167, 139, 250, 0.20)'
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.14) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};
