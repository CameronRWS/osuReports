module.exports = {
  purge: ["./pages/**/*.vue", "./components/**/*.vue", "./layouts/**/*.vue"],
  theme: {
    textShadow: {
      default: "0 2px 5px rgba(0, 0, 0, 0.5)",
      hard: "0 3px 1px rgba(0, 0, 0, 0.25)",
      "sm-hard": "0 2px 1px rgba(0, 0, 0, 0.25)",
      lg: "0 2px 10px rgba(0, 0, 0, 0.5)"
    },
    extend: {
      boxShadow: {
        hard: "0 3px 1px rgba(0, 0, 0, 0.25)",
        "sm-hard": "0 2px 1px rgba(0, 0, 0, 0.25)"
      },
      fontSize: {
        "7xl": "5rem",
        "8xl": "6rem"
      }
    }
  },
  variants: {},
  plugins: [require("tailwindcss-typography")()]
};
