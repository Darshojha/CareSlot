/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(14, 116, 144, 0.08)',
        hover: '0 12px 36px rgba(14, 116, 144, 0.14)'
      },
      colors: {
        brand: {
          50: '#effffd',
          100: '#dffdfa',
          200: '#c3f7f3',
          300: '#99ece7',
          400: '#64ddd8',
          500: '#36c6c3',
          600: '#1ca7a8',
          700: '#1d8488'
        }
      }
    }
  },
  plugins: []
};
