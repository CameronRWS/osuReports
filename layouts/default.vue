<template>
  <section>
    <header>
      <div class="navbar navbar-dark bg-dark shadow-sm">
        <div class="container d-flex justify-content-between">
          <a href="/" class="navbar-brand d-flex align-items-center">
            <strong>osu! Reports</strong>
          </a>
          <div v-if="player">
            <nuxt-link to="/player" class="navbar-brand align-middle">
              <strong> Signed in as: @{{ player.twitterUsername }} </strong>
            </nuxt-link>
            <button class="btn btn-secondary my-2" @click="logout">
              Logout
            </button>
          </div>
          <a v-else href="/twitter/login" class="btn btn-secondary my-2">
            Login
          </a>
        </div>
      </div>
    </header>

    <nuxt />

    <footer>
      <section class="center mb-4">
        <nuxt-link to="/privacy">
          <strong>Privacy Policy</strong>
        </nuxt-link>
      </section>
    </footer>
  </section>
</template>

<style lang="scss" scoped>
footer {
  text-align: center;
}
</style>

<script>
import { mapState, mapActions } from "vuex";
export default {
  computed: {
    ...mapState(["player"])
  },
  methods: {
    logout() {
      this.$api
        .logout()
        .then(() => this.$store.dispatch("logout"))
        .then(() => this.$router.push("/"));
    }
  }
};
</script>
