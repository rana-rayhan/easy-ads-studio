// tailwind.config.js
// Colors come from the Easy Ads palette: sage, butter, apricot and espresso on a light "paper" background.
// The same hex values are used by antd in src/shared/theme/antdTheme.ts, so both libraries match.
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F8F9EE",
        sage: {
          50: "#F4F6E8",
          100: "#EEF3DC",
          200: "#DCE6BE",
          300: "#C5D59A",
          400: "#ABC270",
          500: "#93A85A",
          600: "#7E9147",
          700: "#5E6E33",
          800: "#435026",
          900: "#2C351A",
        },
        butter: {
          50: "#FFF8E6",
          100: "#FFEFC7",
          200: "#FEDD95",
          300: "#FED27D",
          400: "#FEC868",
          500: "#F5B640",
        },
        apricot: {
          100: "#FFE6D4",
          300: "#FEC195",
          400: "#FDA769",
          500: "#F08C45",
          700: "#9A4E19",
        },
        espresso: {
          300: "#B3ABA2",
          400: "#9A968C",
          500: "#7A7268",
          700: "#5A4E44",
          800: "#473C33",
          900: "#2E2620",
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
        display: ["Gabarito", '"Hanken Grotesk"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
