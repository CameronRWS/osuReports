<template>
  <main role="main">
    <section class="jumbotron text-center">
      <div>
        <h1 class="jumbotron-heading">Your osu! Reports</h1>
      </div>
      <br />
      <br />
      <div class="container">
        <table align="center" style="text-align:left;">
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
          <session-row v-for="session in sessions" :key="session.sessionID" v-bind="session" />
        </table>
        <br />
        <br />
        <nuxt-link to="/player" class="btn btn-primary my-2">Back to dashboard</nuxt-link>
      </div>
    </section>
  </main>
</template>

<script>
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
};
</script>

<style>
td,
th {
  padding: 0 15px;
}

@media only screen and (max-width: 900px),
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
  thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  /* tr {
    border: 1px solid #ccc;
  } */

  td {
    /* Behave  like a "row" */
    border: none;
    border-bottom: 1px solid #eee;
    position: relative;
    padding-left: 50%;
  }

  td:before {
    /* Now like a table header */
    position: absolute;
    /* Top/left values mimic padding */
    top: 6px;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
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
  td:nth-of-type(9):before {
    content: "";
  }
}
</style>
