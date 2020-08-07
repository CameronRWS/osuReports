<template>
  <article class="container mx-auto">
    <div class="flex mb-8">
      <logo class="mx-auto" />
    </div>

    <section class="flex flex-wrap justify-center my-6">
      <div class="w-full p-4 bg-white rounded shadow md:w-5/12 lg:w-1/3">
        <h3 class="text-xl leading-loose">What is osu! Reports?</h3>
        <p>
          osu! Reports records your osu! standard plays and groups them into
          sessions by playtime. When you sign up, our bot will watch your plays
          and DM you on Twitter with a summary of your stats once you finish.
          Tweet the session link that we DM you and tag
          <twitter-link handle="osuReports" class="underline hover:underline md:no-underline" />&nbsp;and the bot will automatically retweet you!
        </p>
      </div>
      <div
        class="flex flex-col justify-between w-full p-4 mt-6 bg-white rounded shadow md:w-5/12 lg:w-1/3 md:ml-6 md:mt-0"
      >
        <div>
          <p>
            Recording {{ stats.plays.toLocaleString("US-en") }} plays across
            {{ stats.sessions.toLocaleString("US-en") }} sessions!
          </p>
          <p
            class="mt-2"
          >Join the {{ stats.players }} others already recording their plays by clicking the button below!</p>
        </div>

        <div v-if="!player" class="mt-2">
          <a href="/twitter/login" class="w-full my-2 btn btn-primary">
            <strong>Login with Twitter</strong>
          </a>
        </div>
        <div v-else class="mt-2">
          <nuxt-link to="/player" class="w-full my-2 btn btn-primary">Go to Dashboard</nuxt-link>
        </div>
      </div>
    </section>
  </article>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["stats", "player"]),
  },
};
</script>
