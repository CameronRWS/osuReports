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
      <img
        class="hidden"
        alt="background loader helper"
        :src="bg"
        @error="missingBg"
      />
      <div class="flex flex-row flex-grow">
        <div
          class="flex flex-col items-center justify-between flex-grow md:items-start"
        >
          <div
            class="mb-2 text-xl leading-tight text-center md:text-left md:mb-0"
          >
            <span class="ellipsis blue-text">
              {{ title }}
              <span class="no-ellipsis">[{{ version }}]</span>
            </span>
            <span
              class="block text-base md:ml-2 md:inline-block md:whitespace-no-wrap white-text"
              >by {{ artist }}</span
            >
          </div>
          <play-stats
            class="flex flex-row flex-wrap items-center justify-center mb-2 text-sm leading-tight text-right md:hidden"
            :small="true"
            :counts100="counts100"
            :counts300="counts300"
            :counts50="counts50"
            :countsMiss="countsMiss"
            :mods="mods"
            :playAccuracy="playAccuracy"
            :playPP="playPP"
            :rank="rank"
          />
          <div class="md:flex md:flex-row">
            <div class="hidden mr-2 md:block">
              <div>
                <span class="blue-text">Combo:</span>
              </div>
              <div>
                <span class="blue-text">BPM:</span>
              </div>
              <div>
                <span class="blue-text">Duration:</span>
              </div>
              <div>
                <span class="blue-text">Difficulty:</span>
              </div>
            </div>
            <div class="text-center md:text-right">
              <span class="whitespace-no-wrap md:block">
                <span class="white-text"> {{ combo }} / {{ maxCombo }} </span>
              </span>
              <span class="ml-2 whitespace-no-wrap md:ml-0 md:block">
                <span class="white-text"> {{ bpm }} bpm </span>
              </span>
              <span class="ml-2 whitespace-no-wrap md:ml-0 md:block">
                <span class="white-text">
                  {{ playDuration }}
                </span>
              </span>
              <span class="ml-2 whitespace-no-wrap md:ml-0 md:block">
                <span class="white-text">
                  {{ difficulty }}
                  <star class="inline-block" />
                </span>
              </span>
            </div>
          </div>
        </div>
        <play-stats
          class="flex-col justify-between flex-shrink-0 hidden ml-auto leading-tight text-right md:flex"
          :counts100="counts100"
          :counts300="counts300"
          :counts50="counts50"
          :countsMiss="countsMiss"
          :mods="mods"
          :playAccuracy="playAccuracy"
          :playPP="playPP"
          :rank="rank"
        />
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import Vue from "vue";
import Stars from "~/components/stars.vue";
import Rank from "~/components/rank.vue";
import Mod from "~/components/mod.vue";
import PlayStats from "~/components/play-stats.vue";

const DEFAULT_BACKGROUND =
  "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg";

const BG_REGEX = /https:\/\/assets\.ppy\.sh\/beatmaps\/(\d+)\/covers\/cover.jpg/i;

export default Vue.extend({
  components: {
    Stars,
    Rank,
    Mod,
    PlayStats
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
