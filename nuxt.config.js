export default {
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  css: ["bootstrap/dist/css/bootstrap.css"],
  serverMiddleware: [
    "~/src/server/middleware.js",
    "~/src/server/api/middleware.js",
    "~/src/server/api/twitter.js"
  ],
  modules: ["@nuxt/http"],
  plugins: ["~/plugins/api"]
};
