/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        surface: "#0f0f13",
        panel:   "#16161d",
        border:  "#2a2a35",
        accent:  "#7c6af7",
        "accent-dim": "#5b4fd6",
        muted:   "#6b6b80",
      },
    },
  },
  plugins: [],
};
