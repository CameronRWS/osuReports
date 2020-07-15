<template>
  <main role="main" v-if="player">
    <section class="jumbotron text-center">
      <div>
        <h1 class="jumbotron-heading">
          osu! Reports are currently {{ player.osu ? "enabled" : "disabled" }}
        </h1>
      </div>

      <p v-if="player.osu">Assigned osu! username: {{ player.osu.username }}</p>

      <div v-if="player.osu">
        <strong>You have {{ player.stats.sessions }} recorded sessions.</strong>

        <div v-if="['penz_', 'BelfryPossum'].includes(player.twitterUsername)">
          <a href="/whitelist" class="btn btn-link my-2">
            <strong>See list of current users!</strong>
          </a>
          <br />
          <a href="/sessionslist" class="btn btn-link my-2">
            <strong>See list of sessions!</strong>
          </a>
        </div>

        <div>
          <form action="/action_disable" method="POST">
            <input
              type="hidden"
              :twitterUsername="`@${player.twitterUsername}`"
              name="twitterUsername"
              :value="`@${player.twitterUsername}`"
            />
            <button class="btn btn-danger my-2">Disable osu! Reports</button>
          </form>
        </div>
      </div>

      <div v-else>
        <form action="/action_enable" method="POST">
          <input
            username="osu! username"
            name="username"
            placeholder=" osu! username"
          />
          <input
            type="hidden"
            name="twitterUsername"
            :value="`@${player.twitterUsername}`"
          />
          <button class="btn btn-success my-2">Enable osu! Reports</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script>
import { mapState } from "vuex";
export default {
  middleware: ["authed"],
  computed: {
    ...mapState(["player"])
  }
};
</script>
