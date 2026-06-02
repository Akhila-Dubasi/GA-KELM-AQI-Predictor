export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aqi-bg': '#0f172a', /* darker blue for better contrast */
        'aqi-card-glass': 'rgba(30, 41, 59, 0.7)',
        'aqi-light': '#38bdf8', /* sky-400 */
        'aqi-primary': '#818cf8', /* indigo-400 */
        'aqi-secondary': '#a78bfa', /* violet-400 */
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to right bottom, #1e1b4b, #312e81, #1e3a8a, #0f172a)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 15px rgba(129, 140, 248, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
