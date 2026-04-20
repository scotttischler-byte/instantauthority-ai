import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#1A1A2E",
        electric: "#0F3460",
        cyan: "#00D4FF",
        surface: "#F8FAFF",
      },
    },
  },
};

export default config;
