<template>
  <article class="container max-w-screen-sm mx-auto">
    <div class="flex justify-center">
      <a
        :href="`https://osu.ppy.sh/users/${this.session.osu.username}`"
        target="_blank"
        class="block"
      >
        <session-top v-bind="session" class="my-2" />
      </a>
    </div>
    <div class="flex flex-col items-center">
      <play
        v-for="play in plays"
        :key="play.date"
        v-bind="play"
        class="w-full max-w-screen-sm mt-6"
      />
    </div>
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import { MetaInfo } from "vue-meta";
import { mapState } from "vuex";

function getBaseUrl(req) {
  const origin = process.server
    ? `https://${req.headers.host}`
    : window.location.origin;
  // remove a trailing slash if it exists
  return origin.replace(/\/$/, "");
}

export default Vue.extend({
  data() {
    return {
      plays: [] as osuReports.Play[],
      session: null as osuReports.Session | null,
      sessionId: null as string | null,
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
  validate(ctx): boolean {
    const reportId = ctx.params.sessionId;
    return !!reportId && !/\D/.test(reportId);
  },
  head(): MetaInfo {
    return {
      title: "osu! Report",
      meta: [
        {
          hid: "otherTitle",
          property: "og:title",
          content: `${this.session?.osu?.username}'s osu! Report - ${
            this.plays.length
          } play${this.plays.length === 1 ? "" : "s"}`
        },
        {
          hid: "otherContent",
          name: "og:image",
          content: `${this.baseUrl}/api/player/sessions/${this.sessionId}/reportCard.png`
        },
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "twitterTitle",
          name: "twitter:title",
          content: `${this.session?.osu?.username}'s osu! Report - ${
            this.plays.length
          } play${this.plays.length === 1 ? "" : "s"}`
        },
        {
          hid: "twitterDesc",
          name: "twitter:description",
          content: `Click this link to see the full report on the official osu! Reports website.`
        },
        {
          hid: "twitterImage",
          name: "twitter:image",
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
});
</script>
