/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#02b3fa',      // bright cyan (glow)
        electric: '#0aefff',     // electric cyan
        gold: '#fcc73e',         // golden accent
        neon: '#e75416',         // neon orange
        coral: '#ab725c',        // soft coral
        bg: '#010830',           // deep background
        surface: '#0a1827',      // panel background
        glass: 'rgba(2,179,250,0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif']
      },
      container: {
        center: true,
        padding: '1rem'
      }
    },
  },
  plugins: [],
}

