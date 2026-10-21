/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4ea',
          100: '#ffe3c8',
          500: '#fb7701',
          600: '#e56a00',
          700: '#c25a00',
        },
      },
    },
  },
  plugins: [],
};
