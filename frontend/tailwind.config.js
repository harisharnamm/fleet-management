/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f6f7f9',
          100: '#edeef2',
          200: '#d7dbe2',
          700: '#2b303c',
          800: '#1e222b',
          900: '#14171d',
          950: '#0d0f13',
        },
        brand: {
          50: '#eef6ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}
