/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00A8F3",
        secondary: "#F0F8FF",
        surface: "#FFFFFF",
        outline: "#1A2B45",
        accent: "#FFD700"
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive', 'monospace'], // Suggesting a retro font
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
