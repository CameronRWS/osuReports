<template>
  <div class="play">
    <div class="play-container">
      <div class="layer">
        <div class="image-container" :style="style">
          <img alt="bg" style="display: none" :src="bg" @error="missingBg" />
        </div>
      </div>
      <div class="row text-content flex-wrap flex-xl-nowrap">
        <div
          class="col-md-8 col-12 col-xl-12 col-xxl-8 d-flex flex-column justify-content-between align-items-center align-items-xl-center align-items-md-start align-items-xxl-start"
        >
          <div class="title-artist-group">
            <div class="play-title blue-text">{{ title }} [{{ version }}]</div>
            <div class="artist white-text">by {{ artist }}</div>
          </div>
          <div
            class="d-md-none d-flex my-2 flex-wrap small-play-stats justify-content-center align-items-center d-xl-flex d-xxl-none"
          >
            <div class="play-accuracy gold-text mx-2">
              {{ (+playAccuracy).toFixed(2) }}%
            </div>
            <div class="rank mx-2">
              <rank :rank="rank" class="align-middle" />
            </div>
            <div class="counts white-text my-auto mx-2">
              <span class="blue-text">{{ counts300 }}</span> /
              <span class="green-text">{{ counts100 }}</span> /
              <span class="gold-text">{{ counts50 }}</span> /
              <span class="red-text">{{ countsMiss }}</span>
            </div>
            <div class="performance gold-text mx-2">
              {{ Math.ceil(parseFloat(playPP)) }}pp
            </div>
            <div>
              <mod
                v-for="mod in modList"
                :key="mod"
                :mod="mod"
                class="align-middle"
              />
            </div>
          </div>
          <div
            class="song-stats flex-wrap flex-sm-nowrap align-items-baseline justify-content-around justify-content-md-start"
          >
            <table>
              <tbody>
                <tr>
                  <td>Circle Size:</td>
                  <td>{{ (+circleSize).toFixed(1) }}</td>
                </tr>
                <tr>
                  <td>HP Drain:</td>
                  <td>{{ (+healthPoints).toFixed(1) }}</td>
                </tr>
                <tr>
                  <td>Approach Rate:</td>
                  <td>{{ (+approachRate).toFixed(1) }}</td>
                </tr>
                <tr>
                  <td>Overall Difficulty:</td>
                  <td>{{ (+overallDifficulty).toFixed(1) }}</td>
                </tr>
                <!-- <tr class="d-table-row d-sm-none pt-2">
                  <td class="p-2">{{ ' ' }}</td>
                  <td class="p-2">{{ ' ' }}</td>
                </tr>
                <tr class="d-table-row d-sm-none mt-2">
                  <td>Combo:</td>
                  <td>{{ combo }} / {{ maxCombo }}</td>
                </tr>
                <tr class="d-table-row d-sm-none">
                  <td>BPM:</td>
                  <td>{{ bpm }}</td>
                </tr>
                <tr class="d-table-row d-sm-none">
                  <td>Duration:</td>
                  <td>{{ playDuration }}</td>
                </tr>
                <tr class="d-table-row d-sm-none">
                  <td>Difficulty:</td>
                  <td>
                    <stars class="align-middle" :nStars="difficulty" />
                    ({{ difficulty }})
                  </td>
                </tr>-->
              </tbody>
            </table>
            <table class="ml-sm-2 mt-2 d-sm-table">
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
                    <stars class="align-middle" :nStars="difficulty" />
                    ({{ difficulty }})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          class="col-md-4 ml-auto d-none d-md-flex d-xl-none d-xxl-flex flex-column justify-content-between"
        >
          <div class="play-accuracy gold-text right">
            {{ (+playAccuracy).toFixed(2) }}%
          </div>
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
          <div class="performance right gold-text">
            {{ Math.ceil(parseFloat(playPP)) }}pp
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Stars from "~/components/stars.vue";
import Rank from "~/components/rank.vue";
import Mod from "~/components/mod.vue";

const DEFAULT_BACKGROUND =
  "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg";

const BG_REGEX = /https:\/\/assets\.ppy\.sh\/beatmaps\/(\d+)\/covers\/cover.jpg/i;

export default Vue.extend({
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
  data() {
    return {
      overrideBg: null as string | null
    };
  },
  computed: {
    style(): { backgroundImage: string } {
      return {
        backgroundImage: `url("${this.overrideBg || this.bg}")`
      };
    },
    modList(): string[] {
      return this.mods.split(/,\s+/).filter(mod => mod.trim() !== "");
    },
    beatmapId(): string {
      const match = [...(BG_REGEX.exec(this.bg) || [])];
      return match[1];
    }
  },
  methods: {
    missingBg(): void {
      this.overrideBg = DEFAULT_BACKGROUND;
    }
  }
});
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
  /* min-width: 30rem; */
  line-height: 1.25;

  padding: 0.5em;
}

.play-container {
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
}

.small-play-stats {
  font-size: x-small;
}

.song-stats {
  display: flex;
  flex-direction: row;
}

table {
  border: 0;
  display: block;

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
  min-height: 1.5em;
}

.counts {
  font-size: 1.5em;
}

.performance {
  margin-top: -0.1em;
  font-size: 2em;
}

@media screen and (max-width: 450px) {
  .play {
    font-size: 0.7em;
  }

  .small-play-stats {
    font-size: 0.6em;
  }

  table + table {
    margin-left: 1em;
  }
}
</style>
