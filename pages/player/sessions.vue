<template>
  <main role="main">
    <section class="jumbotron text-center">
      <div>
        <h1 class="jumbotron-heading">Your osu! Reports</h1>
      </div>
      <table style="width:100%">
        <tr>
          <session v-for="session in sessions" :key="session.sessionID" v-bind="session" />
        </tr>
      </table>
      <nuxt-link to="/player" class="btn btn-primary my-2">Back to dashboard</nuxt-link>
    </section>
  </main>
</template>

<script>
import twitterLink from "~/components/twitter-link.vue";
import session from "~/components/session.vue";
export default {
  middleware: ["authed"],
  components: { session },
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
