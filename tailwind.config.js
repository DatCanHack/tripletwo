/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Container chuẩn cho toàn site
    container: {
      center: true,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.25rem",
        lg: "2rem",
        xl: "2rem",
        "2xl": "2rem",
      },
    },
    extend: {
      screens: { "3xl": "1600px" },
      colors: {
        brand: { DEFAULT: "#00B3A4" },
      },
    },
  },
  plugins: [typography()], // 👈 bật plugin prose
};
