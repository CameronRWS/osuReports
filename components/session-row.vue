<template>
  <tr>
    <td>{{ dateFormat }}</td>
    <td>{{ sessionDuration }}</td>
    <td>
      #{{ parseFloat(globalRank).toLocaleString("en") }}
      <span
        v-if="difGlobalRank.includes('+')"
        class="text-green-600"
      >
        {{
        difGlobalRank
        }}
      </span>
      <span v-if="difGlobalRank.includes('-')" class="text-red-600">
        {{
        difGlobalRank
        }}
      </span>
    </td>
    <td>
      #{{ parseFloat(countryRank).toLocaleString("en") }}
      <span
        v-if="difCountryRank.includes('+')"
        class="text-green-600"
      >
        {{
        difCountryRank
        }}
      </span>
      <span v-if="difCountryRank.includes('-')" class="text-red-600">
        {{
        difCountryRank
        }}
      </span>
    </td>
    <td>
      {{ (+accuracy).toFixed(2) }}%
      <span v-if="difAcc.includes('+')" class="text-green-600">{{ difAcc }}</span>
      <span v-if="difAcc.includes('-')" class="text-red-600">{{ difAcc }}</span>
    </td>
    <td>
      {{ parseFloat(totalPP).toLocaleString("en") }}
      <span
        v-if="difPP.includes('+')"
        class="text-green-600"
      >{{ difPP }}</span>
      <span v-if="difPP.includes('-')" class="text-red-600">{{ difPP }}</span>
    </td>
    <td>
      {{ parseFloat(playCount).toLocaleString("en") }}
      <span
        v-if="difPlayCount.includes('+')"
        class="text-green-600"
      >
        {{
        difPlayCount
        }}
      </span>
      <span v-if="difPlayCount.includes('-')" class="text-red-600">
        {{
        difPlayCount
        }}
      </span>
    </td>
    <td>
      {{ (+level).toFixed(2) }}
      <span v-if="difLevel.includes('+')" class="text-green-600">
        {{
        difLevel
        }}
      </span>
      <span v-if="difLevel.includes('-')" class="text-red-600">{{ difLevel }}</span>
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
