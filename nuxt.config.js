export default {
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  css: ["~/assets/scss/custom.scss"],
  serverMiddleware: [
    "~/src/server/middleware.js",
    "~/src/server/api/middleware.js",
    "~/src/server/api/twitter.js"
  ],
  modules: ["@nuxt/http", "~/modules/bootstrap", "~/modules/extractCSS"],
  plugins: ["~/plugins/api"],
  http: {
    browserBaseURL: "/"
  },
  components: true
};
