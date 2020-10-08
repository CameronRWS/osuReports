<template>
  <a :href="`https://twitter.com/${handle}`">@{{ handle }}</a>
</template>

<script>
export default {
  props: {
    handle: { type: String, required: true }
  }
};
</script>
