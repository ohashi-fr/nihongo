import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F5",
        ink: "#1a1a1a",
        sumi: "#2b2b2b",
        accent: "#C0392B",
        muted: "#6b6b6b",
        border: "#e8e3da",
        soft: "#f3efe7",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        jp: ["var(--font-jp)", "var(--font-sans)", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
