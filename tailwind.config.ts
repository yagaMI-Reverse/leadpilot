import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        "primary-dark": "#6D28D9",
        secondary: "#6366F1",
        accent: "#EC4899",
        surface: "#FAF5FF",
        muted: "#F7F3FD",
        line: "#EFE7FC",
        ink: "#0F172A",
        "ink-dim": "#475569",
        "ink-faint": "#94A3B8",
      },
      fontFamily: {
        display: ["var(--font-calistoga)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgba(124, 58, 237, 0.12)",
        lift: "0 12px 40px -12px rgba(124, 58, 237, 0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
