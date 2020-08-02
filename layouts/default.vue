<template>
  <section class="root">
    <header>
      <div
        ref="nav"
        class="navbar navbar-dark navbar-expand-md bg-dark shadow-sm"
      >
        <div class="container d-flex">
          <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#player-collapse"
            aria-controls="player-collapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <nuxt-link
            to="/"
            class="navbar-brand d-flex align-items-center ml-3 ml-md-0 mr-auto"
          >
            <strong>osu! Reports</strong>
          </nuxt-link>
          <div
            v-if="player"
            class="collapse navbar-collapse justify-content-end"
            id="player-collapse"
          >
            <form action="/logout" method="POST">
              <nuxt-link to="/player" class="navbar-brand align-middle">
                <strong>Signed in as: @{{ player.twitterUsername }}</strong>
              </nuxt-link>
              <button
                type="submit"
                class="btn btn-secondary my-2"
                @click.prevent="logout"
              >
                Logout
              </button>
            </form>
          </div>
          <a v-else href="/twitter/login" class="btn btn-secondary my-2"
            >Login</a
          >
        </div>
      </div>
    </header>

    <section
      v-if="flash && flash.length > 0"
      class="jumbotron mt-0 mb-n1 py-2 rounded-0"
    >
      <div class="container">
        <div
          class="alert alert-danger"
          role="alert"
          v-for="(f, idx) in flash"
          :key="idx"
        >
          {{ f }}
        </div>
      </div>
    </section>

    <nuxt />

    <footer>
      <section class="center mt-4 py-4 bg-light">
        <nuxt-link to="/privacy">
          <strong>Privacy Policy</strong>
        </nuxt-link>
      </section>
    </footer>
    <floating-button
      v-if="scrollToTopVisible"
      @click="scrollToTop"
      aria-label="scroll to top"
      class="d-block d-xl-none"
    />
  </section>
</template>

<style lang="scss" scoped>
footer {
  text-align: center;
}

.root {
  background-image: url("~assets/images/whiteTriangles.png");
}
</style>

<style>
.jumbotron {
  background: transparent;
}
</style>

<script>
if (!process || !process.server) require("bootstrap");
import $ from "jquery";

import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      scrollToTopVisible: false
    };
  },
  computed: {
    ...mapState(["player", "flash"])
  },
  methods: {
    logout() {
      this.$api
        .logout()
        .then(() => this.$store.dispatch("logout"))
        .then(() => this.$router.push("/"));
    },
    scrollToTop() {
      $("html, body").animate({ scrollTop: 0 }, 800);
    }
  },
  head() {
    return {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      title: "osu! Reports",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1.0" }
      ],
      htmlAttrs: {
        class: "bg-light"
      }
    };
  },
  mounted() {
    try {
      const observer = new IntersectionObserver(
        entries => {
          let shouldBeVisible = false;
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              shouldBeVisible = true;
              break;
            }
          }
          this.scrollToTopVisible = shouldBeVisible;
        },
        { threshold: 0 }
      );
      observer.observe(this.$refs.nav);
    } catch (ex) {
      this.scrollToTopVisible = true;
    }
  }
};
</script>
