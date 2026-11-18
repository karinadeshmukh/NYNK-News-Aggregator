/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF9',
          100: '#FAF7F2',
          200: '#F4ECE1',
          300: '#EAE0D0'
        },
        pastel: {
          pink: '#FDE2E4',
          pinkDark: '#F4B0B7',
          blue: '#E2ECE9',
          sky: '#DBEAFE',
          green: '#D8F3DC',
          pistachio: '#CBE896',
          lime: '#D9F99D',
          lilac: '#E8DFF5',
          peach: '#FCE1E4',
          yellow: '#FEF9EF'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'retro': '3px 3px 0px 0px rgba(15, 23, 42, 0.85)',
        'retro-sm': '2px 2px 0px 0px rgba(15, 23, 42, 0.85)',
        'retro-lg': '5px 5px 0px 0px rgba(15, 23, 42, 0.9)',
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)'
      }
    },
  },
  plugins: [],
};
