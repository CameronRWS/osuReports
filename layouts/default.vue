<template>
  <div class="root">
    <header class="mb-6 bg-gray-900">
      <navbar ref="nav" :player="player" />
    </header>

    <aside v-if="flash && flash.length > 0" class="px-6 my-6">
      <div class="container mx-auto">
        <div
          class="p-4 text-red-900 bg-red-300 border border-red-500 rounded"
          role="alert"
          v-for="(f, idx) in flash"
          :key="idx"
        >
          {{ f }}
        </div>
      </div>
    </aside>

    <main class="px-6 my-6">
      <nuxt />
    </main>

    <footer class="flex pb-6 mt-6">
      <div class="mx-auto">
        <nuxt-link to="/privacy">
          <strong>Privacy Policy</strong>
        </nuxt-link>
      </div>
    </footer>

    <floating-button
      v-if="scrollToTopVisible"
      @click="scrollToTop"
      aria-label="scroll to top"
      class="d-block d-xl-none"
    />
  </div>
</template>

<style lang="scss" scoped>
.root {
  background-image: url("~assets/images/whiteTriangles.png");
}
</style>

<script>
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
      observer.observe(this.$refs.nav.$el);
    } catch (ex) {
      this.scrollToTopVisible = true;
    }
  }
};
</script>
