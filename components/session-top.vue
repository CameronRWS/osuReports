<template>
  <div class="flex p-px rounded image-container">
    <img
      :src="`/api/player/sessions/${sessionID}/reportCard.png`"
      alt="session-top"
      class="block w-full rounded"
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

<style lang="scss" scoped>
.image-container {
  /* do whatever you want to the background here */
  background: linear-gradient(#bbb, #000);
}
</style>
