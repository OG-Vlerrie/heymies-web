import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F2A44",
          teal: "#1FA3A6",
          gold: "#E3C77A",
          ink: "#0B1220",
          fog: "#F6F8FB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
