<template>
  <section>
    <header>
      <div class="navbar navbar-dark bg-dark shadow-sm">
        <div class="container d-flex justify-content-between">
          <nuxt-link to="/" class="navbar-brand d-flex align-items-center">
            <strong>osu! Reports</strong>
          </nuxt-link>
          <div v-if="player">
            <form action="/logout" method="POST">
              <nuxt-link to="/player" class="navbar-brand align-middle">
                <strong>Signed in as: @{{ player.twitterUsername }}</strong>
              </nuxt-link>
              <button type="submit" class="btn btn-secondary my-2" @click.prevent="logout">Logout</button>
            </form>
          </div>
          <a v-else href="/twitter/login" class="btn btn-secondary my-2">Login</a>
        </div>
      </div>
    </header>

    <section v-if="flash && flash.length > 0" class="jumbotron mt-0 mb-n1 py-2 rounded-0">
      <div class="container">
        <div class="alert alert-danger" role="alert" v-for="f in flash" :key="f">{{ f }}</div>
      </div>
    </section>

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
    ...mapState(["player", "flash"])
  },
  methods: {
    logout() {
      this.$api
        .logout()
        .then(() => this.$store.dispatch("logout"))
        .then(() => this.$router.push("/"));
    }
  },
  head() {
    return {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      title: "osu! Reports"
    };
  }
};
</script>
