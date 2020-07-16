<template>
  <main role="main">
    <section class="jumbotron">
      <div class="container">
        <h1 class="jumbotron-heading">Privacy Policy</h1>
        <p>
          osu! Reports does not retain any personal information on its users
          through signing in on twitter. The sole purpose of signing in through
          twitter is to confirm that you own the twitter account that you may be
          enabling/disabling osu! Reports for. If you have any questions or
          concerns please direct message
          <twitter-link handle="osureports" />.
        </p>
        <p>
          <nuxt-link to="/" class="btn btn-primary my-2"
            >Back to home page</nuxt-link
          >
        </p>
      </div>
    </section>
  </main>
</template>

<script>
import twitterLink from "~/components/twitter-link.vue";
export default {
  components: { twitterLink }
};
</script>
