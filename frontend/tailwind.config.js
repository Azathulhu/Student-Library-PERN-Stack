/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        'bubbly-blue': '#4FC3F7',
        'bubbly-deep': '#1976D2',
        'bubbly-light': '#B3E5FC',
        'bubbly-bg': '#E3F2FD',
        'bubbly-dark': '#222B45',
      },
      borderRadius: {
        'bubbly': '2rem',
        'xl': '1.5rem',
      },
      boxShadow: {
        'bubbly': '0 8px 32px 0 rgba(76,195,247,0.15)',
      },
    },
  },
  plugins: [],
}