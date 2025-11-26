/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#635bff',
        accent: '#ffb347',
        surface: '#0f1729'
      }
    }
  },
  plugins: []
};

