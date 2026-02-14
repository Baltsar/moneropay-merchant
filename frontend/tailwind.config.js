/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        'surface-hover': '#1C1C1C',
        border: '#262626',
        'text-primary': '#FAFAFA',
        'text-secondary': '#8A8A8A',
        accent: '#FF6600',
        'accent-hover': '#FF8533',
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        locked: '#6366F1',
      },
    },
  },
  plugins: [],
}
