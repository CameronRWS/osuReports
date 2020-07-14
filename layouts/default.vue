<template>
  <section>
    <header>
      <div class="navbar navbar-dark bg-dark shadow-sm">
        <div class="container d-flex justify-content-between">
          <a href="/" class="navbar-brand d-flex align-items-center">
            <strong>osu! Reports</strong>
          </a>
          <span v-if="player">
            <nuxt-link to="/player">
              <strong class="navbar-brand">
                Signed in as: @{{ player.twitterUsername }}
              </strong>
            </nuxt-link>
            <a href="/" class="btn btn-secondary my-2">Logout</a>
          </span>
          <a v-else href="/twitter/login" class="btn btn-secondary my-2"
            >Login</a
          >
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
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["player"])
  }
};
</script>
