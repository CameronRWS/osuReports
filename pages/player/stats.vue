<template>
  <main role="main">
    <section class="jumbotron text-center">
      <div>
        <h1 class="jumbotron-heading">osu! Reports Stats</h1>
      </div>
      <p>
        Have any suggestions for data you would like graphed? Message
        <twitter-link handle="osureports" />.
      </p>

      <chart
        :dataPoints="sessions"
        :xProp="el => new Date(+el['date']).toLocaleDateString()"
        yProp="globalRank"
        yLabel="Global Rank"
        :yTicks="value => `#${value}`"
        :reverse="true"
      />
      <chart
        :dataPoints="sessions"
        :xProp="el => new Date(+el['date']).toLocaleDateString()"
        yProp="totalPP"
        yLabel="PP"
      />
      <chart
        :dataPoints="sessions"
        :xProp="el => new Date(+el['date']).toLocaleDateString()"
        yProp="accuracy"
        yLabel="Accuracy %"
      />

      <nuxt-link to="/player" class="btn btn-primary my-2">
        Back to dashboard
      </nuxt-link>
    </section>
  </main>
</template>

<script>
import Chart from "chart.js";
import chart from "~/components/chart.vue";
import twitterLink from "~/components/twitter-link.vue";

export default {
  middleware: ["authed"],
  components: { chart, twitterLink },
  data() {
    return {
      sessions: []
    };
  },
  async asyncData(ctx) {
    const { $api } = ctx.app;

    return { sessions: await $api.getPlayerSessions() };
  }
};
</script>

<style lang="scss" scoped>
canvas {
  padding-left: 0;
  padding-right: 0;
  margin-left: auto;
  margin-right: auto;
  display: block;
  /* width: 800px; */
  width: 80%;
  height: 40%;
}
</style>
