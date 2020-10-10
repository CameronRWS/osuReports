<template>
  <article v-if="player">
    <section class="container p-4 mx-auto bg-white rounded shadow">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 class="text-2xl font-semibold">
          Welcome back, @{{ player.twitterUsername }}!
        </h1>
        <form action="/logout" method="POST">
          <button class="underline" type="submit" @click.prevent="logout">
            Logout
          </button>
        </form>
      </div>
      <div class="my-6">
        <h1>
          osu! Reports are currently
          {{ player.osu ? "enabled" : "disabled" }}
        </h1>

        <p v-if="player.osu">
          Assigned osu! username: {{ player.osu.username }}
        </p>
      </div>

      <div v-if="player.osu">
        <strong>You have {{ player.stats.sessions }} recorded sessions.</strong>

        <div class="flex flex-wrap -ml-2">
          <nuxt-link
            to="/player/sessions"
            class="w-full my-2 ml-2 btn btn-primary md:w-auto md:flex-grow"
            >View your osu! Reports</nuxt-link
          >
          <nuxt-link
            to="/player/stats"
            class="w-full my-2 ml-2 bg-orange-500 btn btn-primary md:w-auto md:flex-grow hover:bg-orange-700"
            >View your osu! Reports Stats</nuxt-link
          >
          <form
            action="/action_disable"
            method="POST"
            class="w-full my-2 ml-2 md:w-auto md:flex-grow"
          >
            <button class="w-full btn btn-danger">Disable osu! Reports</button>
          </form>
        </div>
      </div>

      <div v-else>
        <form
          action="/action_enable"
          method="POST"
          class="flex flex-wrap max-w-lg -ml-2"
        >
          <input
            username="osu! username"
            name="username"
            placeholder=" osu! username"
            class="flex-grow inline-block p-3 my-2 ml-2 bg-gray-300 border border-gray-500 rounded"
          />
          <button
            class="w-full my-2 ml-2 bg-green-600 btn hover:bg-green-800 sm:w-auto"
          >
            Enable osu! Reports
          </button>
        </form>
      </div>
    </section>
  </article>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  middleware: ["authed"],
  computed: {
    ...mapState(["player"])
  },
  methods: {
    async logout() {
      this.$api.logout().then(async () => {
        await this.$store.dispatch('logout');
        await this.$router.replace("/");
      })
    }
  }
};
</script>
