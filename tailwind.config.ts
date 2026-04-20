import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./entities/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F4EF",
        ink: "#1C2736",
        accent: "#1F7A6E",
        amber: "#D9822B",
        line: "#D9D6CF",
        surface: "#FBFAF7",
        muted: "#6D7784",
        success: "#2F7E61",
        warning: "#B56B2D",
        danger: "#767B85",
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        sans: ["Noto Sans SC", "PingFang SC", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 18px 50px rgba(28, 39, 54, 0.08)",
      },
      gridTemplateColumns: {
        workbench: "18rem minmax(0, 1fr) 26rem",
      },
    },
  },
  plugins: [],
};

export default config;
