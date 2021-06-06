export default {
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  css: ["~/assets/css/base.css"],
  serverMiddleware: ["~/src/server/middleware.ts"],
  buildModules: ["@nuxt/typescript-build", "@nuxtjs/tailwindcss"],
  modules: ["@nuxt/http", "~/modules/extractCSS"],
  plugins: ["~/plugins/api", "~/plugins/polyfills"],
  http: {
    browserBaseURL: "/"
  },
  components: true,
  watch: ["~/types/*"],
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        "postcss-focus-visible": {},
        autoprefixer: {}
      }
    }
  },
  head: {
    link: [
      {
        rel: "favicon",
        href: "/favicon.ico"
      }
    ]
  }
};
