import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Design system ────────────────────────────────────────
        // Primary brand: deep blue. Used on primary buttons, big
        // titles, key links.
        primary: {
          DEFAULT: "#051D48",
          50: "#EEF2F9",
          100: "#D7DFEE",
          200: "#A5B5D5",
          300: "#637AAE",
          500: "#1F3A75",
          700: "#0B2858",
          900: "#03132E",
        },
        // Warm accent: CTAs, badges, streaks, gamified bits.
        accent: {
          DEFAULT: "#FFB253",
          50: "#FFF6E9",
          100: "#FFEACC",
          300: "#FFC987",
          500: "#FFB253",
          700: "#E0902A",
          900: "#8F5712",
        },
        // Soft surfaces.
        paper: "#FAFBFD",     // page background — very light cool off-white
        surface: "#FFFFFF",   // card / panel background
        soft: "#F1F5FB",      // hover / muted surface
        // Greys / text.
        ink: "#0F172A",       // primary text
        sumi: "#1E293B",      // strong secondary text
        muted: "#64748B",     // secondary text
        border: "#E2E8F0",    // very soft border
        // Narrow status palette — orange already serves warnings,
        // we only need a green for "correct" feedback.
        success: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        jp: ["var(--font-jp)", "var(--font-sans)", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",     // 8px
        md: "0.75rem",         // 12px
        lg: "1rem",            // 16px
        xl: "1.25rem",         // 20px
        "2xl": "1.5rem",       // 24px — primary cards
        "3xl": "2rem",         // 32px — hero cards
      },
      boxShadow: {
        // Soft & ambient. No harsh borders required.
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        cardHover:
          "0 4px 8px rgba(15, 23, 42, 0.06), 0 16px 36px rgba(15, 23, 42, 0.08)",
        soft: "0 1px 2px rgba(15, 23, 42, 0.04)",
        glow: "0 8px 24px rgba(255, 178, 83, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
