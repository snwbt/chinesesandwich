/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf8f0",
          100: "#faefd9",
          200: "#f4ddb2",
          300: "#ecc47f",
          400: "#e3a44a",
          500: "#d98a28",
          600: "#c0701e",
          700: "#9f561a",
          800: "#81451c",
          900: "#6a3a1a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
