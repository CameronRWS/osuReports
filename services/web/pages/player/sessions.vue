<template>
  <article class="container mx-auto" role="main">
    <section>
      <h1 class="my-6 text-xl leading-relaxed">{{ player.osu.username }}'s osu! Sessions</h1>
      <div class="relative lg:p-6 lg:bg-white lg:rounded lg:shadow">
        <table class="w-full text-left">
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Global Rank</th>
              <th>Country Rank</th>
              <th>Accuracy</th>
              <th>PP</th>
              <th>Play Count</th>
              <th>Level</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <session-row
              v-for="session in sessions"
              :key="session.sessionID"
              v-bind="session"
              class="p-6 my-6 bg-white rounded shadow lg:rounded-none lg:shadow-none lg:bg-transparent"
            />
          </tbody>
        </table>
        <nuxt-link to="/player" class="my-2 btn btn-primary">Back to dashboard</nuxt-link>
      </div>
    </section>
  </article>
</template>

<script>
import { mapState } from "vuex";
import twitterLink from "~/components/twitter-link.vue";
import sessionRow from "~/components/session-row.vue";
export default {
  middleware: ["authed"],
  components: { sessionRow },
  data() {
    return {
      sessions: [],
    };
  },
  async asyncData(ctx) {
    const { $api } = ctx.app;
    //@ts-ignore
    return { sessions: (await $api.getPlayerSessions()).reverse() };
  },
  computed: {
    ...mapState(["player"]),
  },
};
</script>

<style>
td,
th {
  padding: 0 15px;
}

@media only screen and (max-width: 1024px),
  (min-device-width: 768px) and (max-device-width: 1024px) {
  /* Force table to not be like tables anymore */
  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
  }

  /* Hide table headers (but not display: none;, for accessibility) */
  thead tr th {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  td {
    /* Behave  like a "row" */
    border: none;
    position: relative;
    padding-left: 50%;
  }

  td:before {
    /* Now like a table header */
    position: absolute;
    /* Top/left values mimic padding */
    left: 0;
    width: 45%;
    padding-right: 1rem;
    white-space: nowrap;

    font-weight: 700;
  }

  /*
	Label the data
	*/
  td:nth-of-type(1):before {
    content: "Date:";
  }
  td:nth-of-type(2):before {
    content: "Duration:";
  }
  td:nth-of-type(3):before {
    content: "Global Rank:";
  }
  td:nth-of-type(4):before {
    content: "Country Rank:";
  }
  td:nth-of-type(5):before {
    content: "Accuracy:";
  }
  td:nth-of-type(6):before {
    content: "PP:";
  }
  td:nth-of-type(7):before {
    content: "Play Count:";
  }
  td:nth-of-type(8):before {
    content: "Level:";
  }

  td:nth-of-type(9) {
    padding: 0;
    width: 100%;
  }
}
</style>
