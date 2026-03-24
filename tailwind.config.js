/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7ac0ff',
          400: '#36a0ff',
          500: '#0b78e5',
          600: '#0F4C81',
          700: '#0c3a63',
          800: '#0a2847',
          900: '#081d33',
        },
        secondary: {
          50: '#f0f9fb',
          100: '#d0f0f5',
          200: '#a1e0ec',
          300: '#1F7A8C',
          400: '#156b7a',
          500: '#0d5a6d',
          600: '#0a4857',
          700: '#073641',
          800: '#052b34',
          900: '#032028',
        },
        accent: '#F4B400',
        'light-bg': '#F7F9FC',
        'card-surface': '#FFFFFF',
        'text-dark': '#1F2937',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
