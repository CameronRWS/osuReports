<template>
  <div class="flex items-center rounded">
    <img
      :src="`/api/player/sessions/${sessionID}/reportCard.png`"
      alt="session-top"
      class="block w-full h-auto rounded"
    />
  </div>
</template>

<script>
// @ts-ignore
export default {
  props: {
    sessionID: Number
    // tweetID: String,
    // date: String,
    // osuUsername: String,
    // sessionDuration: String,
    // globalRank: Number,
    // difGlobalRank: String,
    // countryRank: Number,
    // difCountryRank: String,
    // level: Number,
    // difLevel: String,
    // accuracy: Number,
    // difAcc: String,
    // totalPP: Number,
    // difPP: String,
    // playCount: Number,
    // difPlayCount: String,
    // countSSPlus: Number,
    // countSS: Number,
    // countSPlus: Number,
    // countS: Number,
    // countA: Number,
  }
};
</script>

