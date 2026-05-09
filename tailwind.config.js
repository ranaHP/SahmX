/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        desert: '#d5a84c',
        emeraldx: '#00e195',
        ink: '#051311'
      },
      boxShadow: {
        glow: '0 0 50px rgba(0, 225, 149, 0.22)',
        gold: '0 0 40px rgba(213, 168, 76, 0.18)'
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.14) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};
