<template>
  <section class="container">
    <div class="row justify-content-center">
      <a
        :href="`https://osu.ppy.sh/users/${this.session.osu.username}`"
        class="d-block w-md-50 h-100"
      >
        <session-top v-bind="session" class="mt-2" />
      </a>
    </div>
    <div class="row justify-content-center">
      <play
        v-for="play in plays"
        :key="play.date"
        v-bind="play"
        class="col-xl-6 col-12"
      />
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";

function getBaseUrl(req) {
  const origin = process.server
    ? `https://${req.headers.host}`
    : window.location.origin;
  // remove a trailing slash if it exists
  return origin.replace(/\/$/, "");
}

export default {
  /** @returns {{plays: osuReports.Play[], session?: osuReports.Session, sessionId?: string, baseUrl: string}} */
  data() {
    return {
      plays: [],
      session: null,
      sessionId: null,
      baseUrl: ""
    };
  },
  async asyncData({ params, app: { $api }, req }) {
    return {
      plays: await $api.getSessionPlays(params.sessionId),
      session: await $api.getSession(params.sessionId),
      sessionId: params.sessionId,
      baseUrl: getBaseUrl(req)
    };
  },
  /** @returns {boolean} */
  validate(ctx) {
    const reportId = ctx.params.sessionId;
    return !!reportId && !/\D/.test(reportId);
  },
  head() {
    return {
      title: "osu! Report",
      meta: [
        {
          hid: "otherTitle",
          property: "og:title",
          // @ts-ignore
          content: `${this.session.osu.username}'s osu! Report - ${
            this.plays.length
          } play${this.plays.length === 1 ? "" : "s"}`
        },
        {
          hid: "otherContent",
          name: "og:image",
          // @ts-ignore
          content: `${this.baseUrl}/api/player/sessions/${this.sessionId}/reportCard.png`
        },
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "twitterTitle",
          name: "twitter:title",
          // @ts-ignore
          content: `${this.session.osu.username}'s osu! Report - ${this.plays.length} play(s)`
        },
        {
          hid: "twitterDesc",
          name: "twitter:description",
          // @ts-ignore
          content: `Click this link to see the full report on the official osu! Reports website.`
        },
        {
          hid: "twitterImage",
          name: "twitter:image",
          // @ts-ignore
          content: `${this.baseUrl}/api/player/sessions/${this.sessionId}/reportCard.png`
        },
        {
          hid: "twitterCard",
          name: "twitter:card",
          content: "summary_large_image"
        }
      ]
    };
  },
  computed: {
    ...mapState(["player"])
  }
};
</script>

<style lang="scss" scoped>
div.row {
  max-width: 1440px;
  margin: 0 auto;
}
</style>
