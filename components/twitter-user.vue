<template>
  <span class="inline-block">
    <img
      :alt="`${user}'s twitter profile image`"
      class="inline-block h-10 rounded shadow-xs md:mr-2"
      :src="image"
    />
    <span class="hidden md:inline-block">@{{ user }}</span>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    user: String,
    image: String
  }
});
</script>

<style></style>
