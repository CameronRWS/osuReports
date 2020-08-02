<template>
  <main role="main">
    <section class="jumbotron text-center" background="bg1.jpg">
      <div class="container">
        <img
          src="~/assets/images/osuReportsLogoOptim.png"
          align="center"
          height="300"
          alt="osu Reports Logo"
        />
        <h3 class="mt-4">Get reports on your osu! sessions tweeted directly to you!</h3>
        <p class="my-4">
          {{ stats.players }} users registered!
          <br />
          {{ stats.plays.toLocaleString("US-en") }} plays and {{ stats.sessions.toLocaleString("US-en") }} sessions recorded!
        </p>
        <p v-if="!player">
          <a href="/twitter/login" class="btn btn-primary my-2">
            <strong>Login with twitter</strong>
          </a>
        </p>
        <p v-else>
          <nuxt-link to="/player" class="btn btn-primary my-2">Go to Dashboard</nuxt-link>
        </p>
      </div>
    </section>
  </main>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["stats", "player"]),
  },
};
</script>
