<template>
  <tr>
    <td>{{ dateFormat }}</td>
    <td>{{ sessionDuration }}</td>
    <td>
      #{{ parseFloat(globalRank).toLocaleString("en") }}
      <span
        v-if="difGlobalRank.includes('+')"
        class="green-text"
      >
        {{
        difGlobalRank
        }}
      </span>
      <span v-if="difGlobalRank.includes('-')" class="red-text">
        {{
        difGlobalRank
        }}
      </span>
    </td>
    <td>
      #{{ parseFloat(countryRank).toLocaleString("en") }}
      <span
        v-if="difCountryRank.includes('+')"
        class="green-text"
      >
        {{
        difCountryRank
        }}
      </span>
      <span v-if="difCountryRank.includes('-')" class="red-text">
        {{
        difCountryRank
        }}
      </span>
    </td>
    <td>
      {{ (+accuracy).toFixed(2) }}%
      <span v-if="difAcc.includes('+')" class="green-text">{{ difAcc }}</span>
      <span v-if="difAcc.includes('-')" class="red-text">{{ difAcc }}</span>
    </td>
    <td>
      {{ parseFloat(totalPP).toLocaleString("en") }}
      <span
        v-if="difPP.includes('+')"
        class="green-text"
      >{{ difPP }}</span>
      <span v-if="difPP.includes('-')" class="red-text">{{ difPP }}</span>
    </td>
    <td>
      {{ parseFloat(playCount).toLocaleString("en") }}
      <span
        v-if="difPlayCount.includes('+')"
        class="green-text"
      >
        {{
        difPlayCount
        }}
      </span>
      <span v-if="difPlayCount.includes('-')" class="red-text">
        {{
        difPlayCount
        }}
      </span>
    </td>
    <td>
      {{ (+level).toFixed(2) }}
      <span v-if="difLevel.includes('+')" class="green-text">
        {{
        difLevel
        }}
      </span>
      <span v-if="difLevel.includes('-')" class="red-text">{{ difLevel }}</span>
    </td>
    <td>
      <nuxt-link :to="`/report/${sessionID}`" class="w-full mt-4 lg:my-2 btn btn-primary">View</nuxt-link>
    </td>
  </tr>
</template>

<script>
// @ts-ignore
export default {
  props: {
    sessionID: Number,
    tweetID: String,
    date: String,
    osuUsername: String,
    sessionDuration: String,
    globalRank: [String, Number],
    difGlobalRank: String,
    countryRank: [String, Number],
    difCountryRank: String,
    level: [String, Number],
    difLevel: String,
    accuracy: [String, Number],
    difAcc: String,
    totalPP: [String, Number],
    difPP: String,
    playCount: [String, Number],
    difPlayCount: String,
    countSSPlus: [String, Number],
    countSS: [String, Number],
    countSPlus: [String, Number],
    countS: [String, Number],
    countA: [String, Number],
  },
  computed: {
    dateFormat() {
      let date;
      //this is because some are in UTC some are epoch
      if (this.date.toString().includes("Z")) {
        date = new Date(this.date);
      } else {
        date = new Date(+this.date);
      }
      return date.toLocaleDateString("US-en");
    },
  },
};
</script>

<style lang="scss" scoped>
.session {
  font-family: "Ubuntu", sans-serif;
  font-weight: 700;
  /* width and color */
  -webkit-text-stroke: 0.5px black;
  height: auto;
  /* min-width: 30rem; */
  line-height: 1.25;

  padding: 0.5em;
  min-height: 4em;
}

.session-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(#bbb, #000);
  position: relative;
  border-radius: 0.5em;
}

.layer {
  position: absolute;
  padding: 0.2em;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.image-container {
  padding: 0.2em;
  height: 100%;
  border-radius: calc(0.5em * 0.75);
  // filter: brightness(50%);
  /* do whatever you want to the background here */
  background: #eee;
  background-size: cover;
  background-repeat: no-repeat;
}

.text-content {
  margin: 0;
  width: 100%;
  height: 100%;
  padding: 0.5em;

  &,
  & * {
    z-index: 1;
  }
}

.right {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
</style>
