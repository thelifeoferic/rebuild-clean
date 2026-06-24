import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "!./outputs/**/*",
  ],
  theme: {
    extend: {
      colors: {
        carbon: "rgb(var(--color-carbon) / <alpha-value>)",
        graphite: "rgb(var(--color-graphite) / <alpha-value>)",
        steel: "rgb(var(--color-steel) / <alpha-value>)",
        champagne: "rgb(var(--color-accent) / <alpha-value>)",
        ember: "rgb(var(--color-ember) / <alpha-value>)",
        signal: "rgb(var(--color-signal) / <alpha-value>)",
        porcelain: "rgb(var(--color-porcelain) / <alpha-value>)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(216, 177, 95, 0.16)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.45)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["Impact", "Arial Black", "var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
