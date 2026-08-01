/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkon: {
          bg: "#07090E",
          card: "#0E131F",
          border: "#1E293B",
          hover: "#172033",
          accent: "#00F0FF",
          primary: "#3B82F6",
          danger: "#EF4444",
          warning: "#F59E0B",
          success: "#10B981"
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.25)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.25)',
        'neon-green': '0 0 20px rgba(16, 185, 129, 0.25)'
      }
    },
  },
  plugins: [],
}
