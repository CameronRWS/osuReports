<template>
  <section class="container">
    <div class="row justify-content-center">
      <session-top v-bind="session" />
      <br />
      <play v-for="play in plays" :key="play.date" v-bind="play" class="col-xl-6 col-12" />
    </div>
  </section>
</template>

<script>
// @ts-ignore
import imagex from "~/assets/images/osuReportsLogoOptim.png";

export default {
  data() {
    return {
      plays: [],
      imagex: imagex,
    };
  },
  async asyncData({ params, app: { $api } }) {
    return {
      plays: await $api.getSessionPlays(params.sessionId),
      session: await $api.getSession(params.sessionId),
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
          content: "osu! Report for: PenZa",
        },
        {
          hid: "twitterDesc",
          name: "twitter:description",
          content:
            "Click this link to be brought to the offical osu! Reports website to view this report!",
        },
        {
          hid: "twitterImage",
          name: "twitter:image",
          content: imagex,
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