module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#5B2C6F',
          lightPurple: '#D7BDE2',
          green: '#3ED598',
          lightGray: '#F6F7FB',
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}; 