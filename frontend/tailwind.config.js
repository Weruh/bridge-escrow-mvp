/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#103D32',
          hover: '#0C2F27',
          deep: '#092B24',
          subtle: '#144C3F',
        },
        deepGreen: '#092B24',
        lime: {
          DEFAULT: '#B7F36B',
          hover: '#A5E853',
          light: '#EBFDD6',
          dark: '#2A4413',
        },
        appBg: '#F5F7F4',
        mainText: '#17231F',
        mutedText: '#75817A',
        appBorder: '#E4EAE5',
        success: '#218653',
        warning: '#E8A23A',
        error: '#D94B4B',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 4px 20px -2px rgba(16, 61, 50, 0.06)',
        dropdown: '0 10px 30px -4px rgba(16, 61, 50, 0.12)',
      }
    },
  },
  plugins: [],
}
