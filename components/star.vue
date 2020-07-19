<template>
  <img src="~static/images/stars/onlinestar.png" :style="{ height }" alt="star" />
</template>

<script>
export default {
  props: {
    partial: { type: Number, default: 1 }
  },
  computed: {
    height() {
      const height =
        this.partial === 1
          ? 1
          : this.partial > 0.6
          ? 0.8
          : this.partial > 0.3
          ? 0.6
          : 0.4;
      return `${height}em`;
    }
  }
};
</script>

<style lang="scss" scoped>
img {
  margin-bottom: 0.25em;
}
</style>
