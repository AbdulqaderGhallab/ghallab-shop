/** @type {import('tailwindcss').Config} */
module.exports = {
  // Define content paths for Tailwind CSS scanning
  content: [
    "./**/*.html",
    "./ts/**/*.ts",
    "./js/**/*.js"
  ],

  // Enable class-based dark mode switching
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        gh: {
          // Dynamic theme tokens (Light / Dark)
          bg: 'var(--bg)',
          bgalt: 'var(--bg-alt)',
          text: 'var(--text)',
          textdim: 'var(--text-dim)',
          line: 'var(--line)',
          panel: 'var(--panel)',

          // Static brand identity colors
          black: '#0a0a0a',
          ink: '#111111',
          charcoal: '#1b1b1b',
          gold: '#c9a24a',
          goldlight: '#e9d38f',
          golddeep: '#8a6a1f',
          cream: '#f7f4ec',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Tajawal', 'Jost', 'sans-serif'],
        amiri: ['"Amiri"', 'serif'],
        cairo: ['"Cairo"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}