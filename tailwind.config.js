/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f6',
          500: '#0e8ce4',
          600: '#0270c3',
          700: '#03599e',
          800: '#074c82',
          900: '#0c3f6c',
          950: '#082949',
        },
        silver: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(255, 255, 255, 0.4)',
          darkSurface: 'rgba(15, 23, 42, 0.75)',
          darkBorder: 'rgba(255, 255, 255, 0.1)',
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        'glass-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        'glass-inset': 'inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.8)',
        'neumorphic-btn': '0 4px 6px -1px rgba(14, 140, 228, 0.25), 0 2px 4px -1px rgba(14, 140, 228, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'neumorphic-active': 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        'glow-cyan': '0 0 20px rgba(56, 169, 246, 0.35)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
