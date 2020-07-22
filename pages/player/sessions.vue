<template>
  <main role="main">
    <section class="jumbotron text-center">
      <div>
        <h1 class="jumbotron-heading">Your osu! Reports</h1>
      </div>
      <table style="width:100%">
        <tr>
          <th>Date</th>
          <th>Session</th>
        </tr>
        <tr v-for="session in sessions" :key="session.sessionId">
          <th>{{session.date}}</th>
          <th>
            <nuxt-link :to="`/report/${session.sessionID}`" class="btn btn-primary my-2">View</nuxt-link>
          </th>
        </tr>
      </table>
      <nuxt-link to="/player" class="btn btn-primary my-2">Back to dashboard</nuxt-link>
    </section>
  </main>
</template>

<script>
import twitterLink from "~/components/twitter-link.vue";

export default {
  middleware: ["authed"],
  components: {},
  data() {
    return {
      sessions: [],
    };
  },
  async asyncData(ctx) {
    const { $api } = ctx.app;

    return { sessions: await $api.getPlayerSessions() };
  },
};
</script>

