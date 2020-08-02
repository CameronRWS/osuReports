<template>
  <section class="container">
    <div class="row justify-content-center">
      <session-top v-bind="session" />
      <img :src="reportCard" alt="session-top" />
      <br />
      <play v-for="play in plays" :key="play.date" v-bind="play" class="col-xl-6 col-12" />
    </div>
  </section>
</template>

<script>
export default {
  async asyncData({ params, app: { $api } }) {
    return {
      plays: await $api.getSessionPlays(params.sessionId),
      session: await $api.getSession(params.sessionId),
      reportCard: await $api.getSessionReportCard(params.sessionId),
    };
  },
  validate(ctx) {
    const reportId = ctx.params.sessionId;
    return !!reportId && !/\D/.test(reportId);
  },
  head() {
    return {
      title: "osu! Report",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "twitterTitle",
          name: "twitter:title",
          content: "osu! Report for <osuUsername>",
        },
        {
          hid: "twitterDesc",
          name: "twitter:description",
          content:
            "Click this link to see all <playsCount> plays on the official osu! Reports website.",
        },
        {
          hid: "twitterImage",
          name: "twitter:image",
          content: "reportCard",
        },
        {
          hid: "twitterCard",
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
div.row {
  max-width: 1440px;
  margin: 0 auto;
}
</style>