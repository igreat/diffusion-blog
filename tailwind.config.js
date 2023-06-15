/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{css,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('@tailwindcss/typography'),
  ],
}
