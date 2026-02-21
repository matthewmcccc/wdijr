export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'dewi': ['RF Dewi', 'sans-serif'],
        'serif': ['British Green', 'serif']
      },
      colors: {
        brand: {
          'light': '#fff',
          'cta': '#04a84b',
          'cta-hover': '#016a2d',
        }
      }
    },
  },
  plugins: [],
}
