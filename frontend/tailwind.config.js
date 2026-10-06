/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          header: '#232f3e',
          headerNav: '#161e2d',
          orange: '#ec7211',
          orangeHover: '#eb5f07',
          blue: '#0972d3',
          blueHover: '#033160',
          bgLight: '#f2f3f3',
          bgDark: '#0f1b2a',
          cardLight: '#ffffff',
          cardDark: '#1d2c3f',
          borderLight: '#d5dbdb',
          borderDark: '#414d5c',
          textLight: '#16191f',
          textDark: '#eaedd1',
          subtextLight: '#545b64',
          subtextDark: '#aab7b8',
        }
      }
    },
  },
  plugins: [],
}
