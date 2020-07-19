<template>
  <div>
    <play v-for="play in plays" :key="play.date" v-bind="play" />
  </div>
</template>

<script>
import Play from "~/components/play.vue";
export default {
  components: {
    Play
  },
  data() {
    return {
      plays: []
    };
  },
  async asyncData({ params, app: { $api } }) {
    return {
      plays: await $api.getSessionPlays(params.sessionId)
    };
  },
  mounted() {
    console.log(this.plays);
  },
  validate(ctx) {
    const reportId = ctx.params.sessionId;
    return !!reportId && !/\D/.test(reportId);
  }
};
</script>
