import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0c0c0c",
        card: "#161616",
        border: "#2a2a2a",
        sage: "#7c9a72",
        slate: "#6b8cae",
        dusty: "#9b7cb8",
        ochre: "#c4956a",
        muted: "#6b6b6b",
        danger: "#b85c5c",
        teal: "#6b9e9e",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
}

export default config
