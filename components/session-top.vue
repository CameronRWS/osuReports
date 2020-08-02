<template>
  <div class="image-container d-flex justify-content-center">
    <img
      :src="`/api/player/sessions/${sessionID}/reportCard.png`"
      alt="session-top"
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
  padding: 0.2em;
  height: 100%;
  border-radius: 0.5em;
  // filter: brightness(50%);
  /* do whatever you want to the background here */
  background: linear-gradient(#bbb, #000);
  background-size: cover;
  background-repeat: no-repeat;

  img {
    border-radius: calc(0.5em * 0.75);
    width: 100%;
    height: auto;
    display: block;
  }
}
</style>
