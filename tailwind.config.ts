import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-space-grotesk)"],
      },
      colors: {
        wellness: {
          green: "#22C55E",
          "green-hover": "#16A34A",
          blue: "#2563EB",
          purple: "#7C3AED",
          yellow: "#FACC15",
        },
      },
    },
  },
  plugins: [],
}

export default config
