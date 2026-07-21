/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        honey: '#F5C518',
        amber: '#D4A373',
        terracotta: '#E76F51',
        pollen: '#FFE66D',
        'hive-white': '#FEFAE0',
        lavender: '#B8A9C9',
        cream: '#FDFBF7',
        beige: '#E8E0D5',
        brown: '#5C4B3F',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
