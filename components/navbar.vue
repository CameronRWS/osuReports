<template>
  <nav ref="nav" class="flex items-center p-6">
    <div
      class="container flex items-baseline justify-between mx-auto text-gray-100"
    >
      <nuxt-link to="/" class="flex-shrink-0 text-xl font-semibold">
        osu! Reports
      </nuxt-link>

      <nuxt-link to="/player" class="font-semibold">
        <twitter-user
          :user="player.twitterUsername"
          :image="player.profileImage"
        />
      </nuxt-link>
      <div v-if="player && false" class="hidden md:block" id="player-collapse">
        <form action="/logout" method="POST">
          <!-- <button
                type="submit"
                class="my-2 btn btn-secondary"
                @click.prevent="logout"
              >
                Logout
              </button> -->
        </form>
      </div>
      <a v-else-if="false" href="/twitter/login" class="my-2 btn btn-secondary"
        >Login</a
      >
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    player: Object
  }
});
</script>
