<template>
  <div class="session">
    <nuxt-link :to="`/report/${sessionID}`">
      <div class="session-container">
        <div class="layer">
          <div class="image-container">
            <!-- <img alt="bg" :src="image" /> -->
          </div>
          <div class="blue-text">{{date}} - {{sessionDuration}} - {{globalRank}}</div>
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
// @ts-ignore
import image from "~/assets/images/spectrumTriangles.jpg";

export default {
  data: function () {
    return {
      image: image,
    };
  },
  props: {
    sessionID: String,
    tweetID: String,
    date: String,
    osuUsername: String,
    sessionDuration: String,
    globalRank: Number,
    difGlobalRank: String,
    countryRank: Number,
    difCountryRank: String,
    level: Number,
    difLevel: String,
    accuracy: Number,
    difAcc: String,
    totalPP: Number,
    difPP: String,
    playCount: Number,
    difPlayCount: String,
    countSSPlus: Number,
    countSS: Number,
    countSPlus: Number,
    countS: Number,
    countA: Number,
  },
};
</script>


<style>
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@700&display=swap");
</style>

<style lang="scss" scoped>
@mixin blue-text {
  background: -webkit-linear-gradient(rgb(112, 212, 255), rgb(0, 191, 255));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.blue-text {
  @include blue-text();
}

.session {
  font-family: "Ubuntu", sans-serif;
  /* width and color */
  -webkit-text-stroke: 0.5px black;
  height: auto;
  /* min-width: 30rem; */
  line-height: 1.25;

  padding: 0.5em;
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
  filter: brightness(50%);
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
