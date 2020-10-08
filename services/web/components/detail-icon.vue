<template>
  <abbr class="inline-block px-1 detail-icon" :title="alt">
    <img class="inline w-5 align-text-top" :src="src" :alt="alt" />
    {{ value }}
  </abbr>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    src: String,
    alt: String,
    value: [String, Number],
  },
});
</script>

<style lang="postcss" scoped>
.detail-icon {
  min-width: 4.5em;
}
abbr {
  text-decoration: none;
}
</style>
