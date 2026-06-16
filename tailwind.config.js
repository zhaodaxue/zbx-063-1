/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bean: {
          50: '#FBF7EF',
          100: '#F5EDE0',
          200: '#E8D9A0',
          300: '#D4A853',
          400: '#C49A4A',
          500: '#8B7355',
          600: '#5C4033',
          700: '#3D2B1F',
          800: '#2A1D15',
          900: '#1A120B',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
