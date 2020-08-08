<template>
  <a
    :href="`https://osu.ppy.sh/beatmapsets/${beatmapId}#osu/`"
    target="_blank"
    class="block p-px rounded play"
  >
    <div
      class="h-full p-4 font-bold bg-cover rounded bg-brightness-50"
      :style="style"
    >
      <img
        class="hidden"
        alt="background loader helper"
        :src="bg"
        @error="missingBg"
      />
      <div class="text-xl">
        <span class="ellipsis blue-text">{{ title }}</span>
        <span class="blue-text">[{{ version }}]</span>
      </div>
      <div class="ml-2 -my-1 white-text">by {{ artist }}</div>
      <div class="flex flex-wrap my-1">
        <play-details
          :circleSize="circleSize"
          :hpDrain="healthPoints"
          :overallDifficulty="overallDifficulty"
          :approachRate="approachRate"
          :stars="difficulty"
        />
        <span class="text-xl gold-text">{{ (+playAccuracy).toFixed(2) }}%</span>
      </div>
    </div>
  </a>
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("${this
          .overrideBg || this.bg}")`
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

<style lang="scss" scoped>
a {
  color: inherit;
  text-decoration: none;
}

.play {
  font-family: "Ubuntu", sans-serif;
  font-weight: 700;
  /* width and color */
  -webkit-text-stroke: 0.5px black;
}

.play {
  background-image: linear-gradient(#bbb, #000);
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
    vertical-align: bottom;
  }

  & td:nth-last-of-type(even) {
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
