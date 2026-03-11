/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
        emerald: {
          500: '#10b981',
        },
        yellow: {
          500: '#eab308',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
    },
  },
  plugins: [],
}
