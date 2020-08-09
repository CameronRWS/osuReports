<template>
  <span class="inline-block px-1">
    <img class="inline h-6" :src="src" :alt="alt" />
    {{ value }}
  </span>
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
