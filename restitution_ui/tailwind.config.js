/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        loading: {
          "0%": { marginLeft: "-100%", width: "40%" },
          "50%": { marginLeft: "30%", width: "40%" },
          "100%": { marginLeft: "100%", width: "40%" },
        },
      },
    },
  },
  plugins: [],
};
