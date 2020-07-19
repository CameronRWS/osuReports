<template>
  <img :alt="`rank ${rank}`" :src="src" />
</template>

<script>
const ranks = {
  // @ts-ignore
  XH: require("~/assets/images/ranks/SSPlus.png"),
  // @ts-ignore
  X: require("~/assets/images/ranks/SS.png"),
  // @ts-ignore
  SH: require("~/assets/images/ranks/SPlus.png"),
  // @ts-ignore
  S: require("~/assets/images/ranks/S.png"),
  // @ts-ignore
  A: require("~/assets/images/ranks/A.png"),
  // @ts-ignore
  B: require("~/assets/images/ranks/B.png"),
  // @ts-ignore
  C: require("~/assets/images/ranks/C.png"),
  // @ts-ignore
  D: require("~/assets/images/ranks/D.png"),
  // @ts-ignore
  F: require("~/assets/images/ranks/F.png")
};

export default {
  props: {
    rank: {
      type: String,
      validator: rank => Object.keys(ranks).includes(rank)
    }
  },
  computed: {
    src() {
      return ranks[this.rank];
    }
  }
};
</script>

<style lang="scss" scoped>
img {
  height: 2.5em;
}
</style>
