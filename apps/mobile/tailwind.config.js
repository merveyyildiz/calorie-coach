/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#22C55E",
        "primary-dark": "#16a34a",
        "primary-light": "#DCFCE7",
        secondary: "#3B82F6",
        "secondary-dark": "#2563EB",
        tertiary: "#F97316",
        "tertiary-dark": "#EA580C",
        protein: "#F97316", // tertiary ile eşlendi
        carbs: "#3B82F6", // secondary ile eşlendi
        fat: "#22C55E", // primary ile eşlendi
        fiber: "#84CC16",
        background: "#F8FAFC",
        card: "#FFFFFF",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-hint": "#94A3B8",
        border: "#E2E8F0",
        success: "#22C55E",
        warning: "#EAB308",
        error: "#EF4444",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        chip: "8px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
