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
          Use the intent link in the DM to tweet and the bot will automatically
          retweet you! Follow us at
          <twitter-link handle="osuReports" class="underline hover:underline md:no-underline" />.
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
          <p class="mt-2">Join {{ stats.players }} others already recording their plays!</p>
        </div>

        <div v-if="!player" class="mt-2">
          <a href="/twitter/login" class="w-full my-2 btn btn-primary">
            <strong>Login with twitter</strong>
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
