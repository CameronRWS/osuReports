<template>
  <img :alt="`rank ${rank}`" :src="src" />
</template>

<script lang="ts">
import Vue from "vue";

const ranks = {
  XH: require("~/assets/images/ranks/SSPlus.png"),
  X: require("~/assets/images/ranks/SS.png"),
  SH: require("~/assets/images/ranks/SPlus.png"),
  S: require("~/assets/images/ranks/S.png"),
  A: require("~/assets/images/ranks/A.png"),
  B: require("~/assets/images/ranks/B.png"),
  C: require("~/assets/images/ranks/C.png"),
  D: require("~/assets/images/ranks/D.png"),
  F: require("~/assets/images/ranks/F.png")
};

export default Vue.extend({
  props: {
    rank: {
      type: String,
      validator: rank => Object.keys(ranks).includes(rank)
    }
  },
  computed: {
    src(): string {
      return ranks[this.rank];
    }
  }
});
</script>

<style lang="scss" scoped>
img {
  height: 2.5em;
}
</style>
