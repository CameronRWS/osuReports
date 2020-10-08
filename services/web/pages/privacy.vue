<template>
  <article class="container mx-auto">
    <div class="p-4 bg-white rounded shadow">
      <h1 class="text-2xl">Privacy Policy</h1>
      <p class="mt-2">
        osu! Reports does not retain any personal information on its users
        through signing in on twitter. The sole purpose of signing in through
        twitter is to confirm that you own the twitter account that you may be
        enabling/disabling osu! Reports for. If you have any questions or
        concerns please direct message
        <twitter-link
          handle="osuReports"
          class="underline hover:underline md:no-underline"
        />.
      </p>
      <p class="mt-2">
        <nuxt-link to="/" class="my-2 btn btn-primary"
          >Back to home page</nuxt-link
        >
      </p>
    </div>
  </article>
</template>

<script>
import twitterLink from "~/components/twitter-link.vue";
export default {
  components: { twitterLink }
};
</script>
