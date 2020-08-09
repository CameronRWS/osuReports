<template>
  <a
    :href="`https://osu.ppy.sh/beatmapsets/${beatmapId}#osu/`"
    target="_blank"
    class="block p-px rounded play"
  >
    <div
      class="flex items-stretch content-start h-full p-4 font-bold bg-cover rounded"
      :style="style"
    >
      <img class="hidden" alt="background loader helper" :src="bg" @error="missingBg" />
      <div class="flex flex-col items-center justify-center flex-grow-0 flex-shrink-0 mr-2">
        <h1 class="text-2xl gold-text">{{ Math.ceil(+playPP) }}pp</h1>
        <span class="text-xl whitespace-no-wrap gold-text">
          <rank :rank="rank" class="inline w-8" />
          {{ (+playAccuracy).toFixed(2) }}%
        </span>
      </div>
      <div class="flex flex-col">
        <div class="text-xl leading-tight">
          <span class="ellipsis blue-text">{{ title }}</span>
          <span class="blue-text">[{{ version }}]</span>
          <span class="ml-2 text-base whitespace-no-wrap white-text">by {{ artist }}</span>
        </div>
        <div class="flex flex-wrap flex-shrink order-3 my-1">
          <play-details
            :combo="maxCombo"
            :bpm="bpm"
            :duration="playDuration"
            :circleSize="circleSize"
            :hpDrain="healthPoints"
            :overallDifficulty="overallDifficulty"
            :approachRate="approachRate"
            :stars="difficulty"
          />
        </div>
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
    Mod,
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
    circleSize: Number,
  },
  data() {
    return {
      overrideBg: null as string | null,
    };
  },
  computed: {
    style(): { backgroundImage: string } {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("${
          this.overrideBg || this.bg
        }")`,
      };
    },
    modList(): string[] {
      return this.mods.split(/,\s+/).filter((mod) => mod.trim() !== "");
    },
    beatmapId(): string {
      const match = [...(BG_REGEX.exec(this.bg) || [])];
      return match[1];
    },
  },
  methods: {
    missingBg(): void {
      this.overrideBg = DEFAULT_BACKGROUND;
    },
  },
});
</script>

