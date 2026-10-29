/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f0',
          100: '#dceadc',
          200: '#bcdabc',
          300: '#8fc290',
          400: '#5ea066',
          500: '#3d8249',
          600: '#2d6a38',
          700: '#24552e',
          800: '#1f4326',
          900: '#173620',
          950: '#0d2014',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e3ece4',
          200: '#c7d8ca',
          300: '#a0bca5',
          400: '#7a9d80',
          500: '#5d8164',
          600: '#48674e',
          700: '#3a5340',
          800: '#304334',
          900: '#283729',
        },
      },
    },
  },
  plugins: [],
};
