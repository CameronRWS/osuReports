<template>
  <span>
    <star v-for="(partial, idx) in stars" :key="idx" :partial="partial" />
  </span>
</template>

<script>
import Star from "~/components/star.vue";

export default {
  components: {
    Star
  },
  props: {
    nStars: { type: Number, default: 12.3 }
  },
  computed: {
    /** @returns {number[]} */
    stars() {
      return [
        ...Array(Math.floor(this.nStars)).fill(1),
        this.nStars % 1
      ].filter(n => n !== 0.0);
    }
  }
};
</script>

<style lang="scss" scoped>
span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  min-width: 0;
}
</style>
