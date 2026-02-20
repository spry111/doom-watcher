import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#FAFAF8",
        surface: "#FFFFFF",
        surfaceAlt: "#F5F4F0",
        border: "#E8E6E1",
        borderLight: "#F0EEEA",
        text: "#1A1A1A",
        textSecondary: "#5C5C5C",
        textMuted: "#9A9A9A",
        textFaint: "#C4C4C4",
        green: {
          primary: "#1B9E6F",
          bg: "#ECFDF5",
          border: "#BBF7D0",
        },
        amber: {
          primary: "#B45309",
          bg: "#FFFBEB",
          border: "#FDE68A",
        },
        danger: {
          primary: "#C2410C",
          bg: "#FFF7ED",
          border: "#FDBA74",
        },
        crisis: {
          primary: "#BE123C",
          bg: "#FFF1F2",
          border: "#FECDD3",
        },
      },
      animation: {
        fadeUp: "fadeUp 0.3s ease",
        subtlePulse: "subtlePulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        subtlePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.015)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
