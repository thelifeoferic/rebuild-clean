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
        carbon: "#08090A",
        graphite: "#111315",
        steel: "#202429",
        champagne: "#D8B15F",
        ember: "#E15F3F",
        signal: "#2EE6A6",
        porcelain: "#F2EEE7",
      },
      boxShadow: {
        glow: "0 0 40px rgba(216, 177, 95, 0.16)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.45)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
