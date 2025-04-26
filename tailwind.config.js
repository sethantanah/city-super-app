/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/views/**/*.ejs"],
    theme: {
      extend: {
        colors: {
          'city-primary': '#3B82F6',
          'city-secondary': '#10B981',
          'city-accent': '#F59E0B',
          'city-dark': '#1F2937',
          'city-light': '#F3F4F6',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }
  