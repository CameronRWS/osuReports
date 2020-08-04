<template>
  <article class="container mx-auto">
    <div class="my-6">
      <h1 class="text-3xl">osu! Reports Stats</h1>
      <p>
        Have any suggestions for data you would like graphed? Message
        <twitter-link handle="osureports" />.
      </p>
    </div>

    <chart
      class="p-4 my-4 bg-white rounded shadow"
      :dataPoints="sessions"
      :xProp="el => new Date(+el['date']).toLocaleDateString()"
      yProp="globalRank"
      yLabel="Global Rank"
      :yTicks="value => `#${value}`"
      :reverse="true"
    />
    <chart
      class="p-4 my-4 bg-white rounded shadow"
      :dataPoints="sessions"
      :xProp="el => new Date(+el['date']).toLocaleDateString()"
      yProp="totalPP"
      yLabel="PP"
    />
    <chart
      class="p-4 my-4 bg-white rounded shadow"
      :dataPoints="sessions"
      :xProp="el => new Date(+el['date']).toLocaleDateString()"
      yProp="accuracy"
      yLabel="Accuracy %"
    />

    <nuxt-link to="/player" class="my-2 btn btn-primary">
      Back to dashboard
    </nuxt-link>
  </article>
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
