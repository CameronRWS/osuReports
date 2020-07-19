<template>
  <div class="play">
    <div class="play-container">
      <div class="layer">
        <div class="image-container" :style="style" />
      </div>
      <div class="text-content">
        <div class="column grow no-basis">
          <div class="title-artist-group">
            <div class="play-title blue-text">{{title}} [{{ version }}]</div>
            <div class="artist white-text">by {{ artist }}</div>
          </div>
          <div class="song-stats">
            <table>
              <tbody>
                <tr>
                  <td>Circle Size:</td>
                  <td>{{ circleSize }}</td>
                </tr>
                <tr>
                  <td>HP Drain:</td>
                  <td>{{ healthPoints }}</td>
                </tr>
                <tr>
                  <td>Approach Rate:</td>
                  <td>{{ approachRate }}</td>
                </tr>
                <tr>
                  <td>Overall Difficulty:</td>
                  <td>{{ overallDifficulty }}</td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr>
                  <td>Combo:</td>
                  <td>{{ combo }} / {{ maxCombo }}</td>
                </tr>
                <tr>
                  <td>BPM:</td>
                  <td>{{ bpm }}</td>
                </tr>
                <tr>
                  <td>Duration:</td>
                  <td>{{ playDuration }}</td>
                </tr>
                <tr>
                  <td>Difficulty:</td>
                  <td>
                    <stars :nStars="difficulty" />
                    ({{ difficulty }})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="column">
          <div class="play-accuracy gold-text right">{{ playAccuracy }}%</div>
          <div class="rank">
            <rank :rank="rank" class="right" />
          </div>
          <div class="mods right">
            <mod v-for="mod in modList" :key="mod" :mod="mod" />
          </div>
          <div class="counts right white-text">
            <span class="blue-text">{{ counts300 }}</span> /
            <span class="green-text">{{ counts100 }}</span> /
            <span class="gold-text">{{ counts50 }}</span> /
            <span class="red-text">{{ countsMiss }}</span>
          </div>
          <div class="performance right gold-text">{{ Math.ceil(parseFloat(playPP)) }}pp</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Stars from "~/components/stars.vue";
import Rank from "~/components/rank.vue";
import Mod from "~/components/mod.vue";

export default {
  components: {
    Stars,
    Rank,
    Mod
  },
  props: {
    sessionId: Number,
    osuUsername: String,
    date: String,
    bg: String,
    title: String,
    version: String,
    artist: String,
    combo: Number,
    maxCombo: Number,
    bpm: Number,
    playDuration: String,
    difficulty: Number,
    playAccuracy: Number,
    rank: String,
    mods: String,
    counts300: Number,
    counts100: Number,
    counts50: Number,
    countsMiss: Number,
    playPP: Number,
    numSpinners: Number,
    numSliders: Number,
    numCircles: Number,
    numObjects: Number,
    approachRate: Number,
    healthPoints: Number,
    overallDifficulty: Number,
    circleSize: Number
  },
  computed: {
    style() {
      return {
        backgroundImage: `url("${this.bg}")`
      };
    },
    modList() {
      return this.mods.split(/,\s+/);
    }
  }
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@700&display=swap");

@mixin blue-text {
  background: -webkit-linear-gradient(rgb(112, 212, 255), rgb(0, 191, 255));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.blue-text {
  @include blue-text();
}

@mixin white-text {
  background: -webkit-linear-gradient(rgb(255, 255, 255), rgb(149, 149, 149));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.white-text {
  @include white-text();
}

@mixin gold-text {
  background: -webkit-linear-gradient(rgb(255, 217, 0), rgb(175, 134, 0));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gold-text {
  @include gold-text();
}

@mixin green-text {
  background: -webkit-linear-gradient(rgb(0, 255, 0), rgb(3, 136, 3));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.green-text {
  @include green-text();
}

@mixin red-text {
  background: -webkit-linear-gradient(rgb(255, 0, 0), #990000);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.red-text {
  @include red-text();
}

* {
  margin: 0;
  padding: 0;
}

.play {
  font-family: "Ubuntu", sans-serif;
  /* width and color */
  -webkit-text-stroke: 0.5px black;
  height: auto;
  padding: 20px;
  min-width: 30rem;
  line-height: 1.25;
}

.play-container {
  width: 100%;
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

.text-content {
  padding: 0.5em;
  height: 100%;

  display: flex;
  justify-content: space-between;
  align-items: stretch;

  &,
  & * {
    z-index: 1;
  }
}

.play-title {
  font-size: 1.5em;
}

.artist {
  margin-left: 1em;
  margin-top: -0.2em;
}

.title-artist-group {
  display: inline-block;
  max-width: 70%;
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.song-stats {
  display: flex;
  flex-direction: row;

  & * + * {
    margin-left: 1em;
  }
}

table {
  border: 0;
  display: block;
  margin-top: 1em;

  font-size: 1.25em;

  & td:nth-last-of-type(odd) {
    @include white-text();
    vertical-align: bottom;
  }

  & td:nth-last-of-type(even) {
    @include blue-text();
    padding-right: 0.25em;
    text-align: right;
    vertical-align: top;
  }
}

.play-accuracy {
  font-size: 2em;
  margin-top: -0.2em;
}

.right {
  margin-left: auto;
  text-align: right;
  display: block;
}

.mods {
  margin: 0.3em 0;
}

.spacer {
  flex: 1;
}

.counts {
  font-size: 1.5em;
}

.performance {
  margin-top: -0.1em;
  font-size: 2em;
}

.grow {
  flex-grow: 1;
}

.no-basis {
  flex-basis: 0;
}
</style>
