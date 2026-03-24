import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f7f3ee",
        surface: "#ffffff",
        "surface-2": "#f0ebe3",
        border: "#e0d8ce",
        wine: {
          DEFAULT: "#7b1d3a",
          light: "#a8294f",
          pale: "rgba(123,29,58,0.08)",
        },
        gold: {
          DEFAULT: "#b8943f",
          pale: "rgba(184,148,63,0.12)",
        },
        green: {
          DEFAULT: "#2d6a4f",
          pale: "rgba(45,106,79,0.1)",
        },
        blue: {
          DEFAULT: "#1d4e89",
          pale: "rgba(29,78,137,0.1)",
        },
        muted: "#8a7e72",
        foreground: "#2c2420",
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};
export default config;
