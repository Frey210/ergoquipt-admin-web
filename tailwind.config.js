// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe8ff',
          500: '#3894FF',
          600: '#2d7be6',
          700: '#1f5db4',
          900: '#0f172a',
        },
        mint: {
          50: '#edfbf6',
          100: '#d0f3e6',
          500: '#5fd0a9',
          600: '#38b68d',
        },
        lilac: {
          50: '#f3f1ff',
          100: '#e3deff',
          500: '#b8b7ff',
          600: '#8b8cf7',
        },
        peach: {
          50: '#fff5eb',
          100: '#ffe6cf',
          500: '#f7b283',
          600: '#f18a4f',
        },
        sky: {
          50: '#eef9ff',
          100: '#d8f1ff',
          500: '#8bd2f8',
          600: '#5fb5e9',
        },
        ink: {
          500: '#0f172a',
          400: '#1f2937',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
