<template>
  <a
    :href="`https://osu.ppy.sh/beatmapsets/${beatmapId}#osu/`"
    target="_blank"
    class="block rounded"
  >
    <div class="h-full p-2 font-bold bg-cover rounded" :style="style">
      <img
        class="hidden"
        alt="background loader helper"
        :src="bg"
        @error="missingBg"
      />
      <div class="flex flex-row flex-grow info-container">
        <div
          class="flex flex-col items-start justify-between flex-grow title-details-container"
        >
          <div class="mb-2 leading-tight md:mb-0 title-container">
            <div class="italic text-blue-400 text-shadow-sm-hard ellipsis">
              {{ title }}
              <span class="not-italic no-ellipsis">[{{ version }}]</span>
            </div>
            <div class="block text-sm text-gray-300 text-shadow-sm-hard">
              {{ artist }}
            </div>
          </div>
          <div
            class="flex flex-col text-sm tracking-tighter text-gray-300 text-shadow-sm-hard details-container"
          >
            <div class="flex flex-row flex-wrap">
              <detail-icon
                :src="playDurationIcon"
                alt="duration"
                :value="playDuration"
              />
              <detail-icon :src="bpmIcon" alt="BPM" :value="bpm" />
              <detail-icon
                :src="difficultyIcon"
                alt="difficulty"
                :value="difficulty"
              />
              <detail-icon
                :src="comboIcon"
                alt="max combo"
                :value="`${combo} / ${maxCombo}`"
              />
            </div>
            <div class="flex flex-row flex-wrap">
              <detail-icon
                :src="circleSizeIcon"
                alt="circle size"
                :value="circleSize"
              />
              <detail-icon
                :src="approachRateIcon"
                alt="approach rate"
                :value="approachRate"
              />
              <detail-icon
                :src="overallDifficultyIcon"
                alt="overall difficulty"
                :value="overallDifficulty"
              />
              <detail-icon
                :src="healthPointsIcon"
                alt="hp drain"
                :value="healthPoints"
              />
            </div>
          </div>
        </div>
        <div
          class="flex flex-col items-end justify-between text-right performance-container"
        >
          <div class="big-contents">
            <div class="text-lg text-yellow-500 text-shadow-sm-hard">
              {{ Math.ceil(+playPP) }}pp
            </div>
            <div
              class="flex flex-row-reverse items-center justify-end -mr-1 rank-mods"
            >
              <rank :rank="rank" class="w-12 mr-1" />
              <mod
                v-for="mod in modList"
                :key="mod"
                :mod="mod"
                class="w-6 mr-1"
              />
            </div>
          </div>
          <div
            class="text-right text-gray-300 text-shadow-sm-hard big-contents"
          >
            <div class="whitespace-no-wrap small-contents">
              <span class="text-blue-400">{{ counts300 }}</span> /
              <span class="text-green-500">{{ counts100 }}</span> /
              <span class="text-yellow-500">{{ counts50 }}</span> /
              <span class="text-red-500">{{ countsMiss }}</span>
            </div>
            <div class="small-contents">({{ playAccuracy }}%)</div>
          </div>
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
import PlayStats from "~/components/play-stats.vue";
import DetailIcon from "~/components/detail-icon.vue";

import playDurationIcon from "~/assets/images/playDetails/duration.png";
import bpmIcon from "~/assets/images/playDetails/bpm.png";
import difficultyIcon from "~/assets/images/playDetails/playDifficulty.png";
import comboIcon from "~/assets/images/playDetails/combo.png";
import circleSizeIcon from "~/assets/images/playDetails/circleSize.png";
import approachRateIcon from "~/assets/images/playDetails/approachRate.png";
import overallDifficultyIcon from "~/assets/images/playDetails/overallDifficulty.png";
import healthPointsIcon from "~/assets/images/playDetails/healthPoints.png";

const DEFAULT_BACKGROUND =
  "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg";

const BG_REGEX = /https:\/\/assets\.ppy\.sh\/beatmaps\/(\d+)\/covers\/cover.jpg/i;

export default Vue.extend({
  components: {
    Stars,
    Rank,
    Mod,
    PlayStats,
    DetailIcon
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
      overrideBg: null as string | null,
      playDurationIcon,
      bpmIcon,
      difficultyIcon,
      comboIcon,
      circleSizeIcon,
      approachRateIcon,
      overallDifficultyIcon,
      healthPointsIcon
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
      return this.mods.split(/\s*,\s*/).filter(mod => mod.trim() !== "");
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

<style lang="postcss" scoped>
@media (max-width: 520px) {
  .info-container {
    flex-direction: column;
  }

  .title-details-container {
    display: contents;
  }

  .title-container {
    order: 1;
    margin-bottom: 0.25rem;
  }

  .details-container {
    order: 3;
    display: table;

    & > div {
      display: table-row;
    }

    & >>> .detail-icon {
      min-width: 0;
      display: table-cell;
      white-space: nowrap;
    }
  }

  .performance-container {
    order: 2;
    text-align: left;
    align-items: flex-start;
    flex-direction: row;
    margin-bottom: 0.25rem;
  }

  .rank-mods {
    flex-direction: row;
  }

  .big-contents {
    display: block;
  }

  .small-contents {
    display: contents;
  }
}

@media (min-width: 520px) {
  .big-contents {
    display: contents;
  }

  .small-contents {
    display: block;
  }
}
</style>
