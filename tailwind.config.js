/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',     // ← Solo agregá esta línea

  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        "gold-dark": "#B8972E",
      },
    },
  },

  plugins: [],
}