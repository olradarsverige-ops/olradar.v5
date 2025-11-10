/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'radial': 'radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)'
      },
      boxShadow: {
        'glass': '0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
      }
    }
  },
  plugins: [],
}
