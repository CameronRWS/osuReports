<template>
  <span class="text-lg">
    <detail-icon :src="durationIcon" alt="duration icon" :value="duration" class="white-text" />
    <detail-icon :src="bpmIcon" alt="BPM icon" :value="bpm" class="white-text" />
    <detail-icon :src="comboIcon" alt="combo icon" :value="combo" class="white-text" />
    <detail-icon
      :src="circleSizeIcon"
      alt="circle size icon"
      :value="(+circleSize).toFixed(2)"
      class="white-text"
    />
    <detail-icon
      :src="healthPointsIcon"
      alt="hp drain icon"
      :value="(+hpDrain).toFixed(2)"
      class="white-text"
    />
    <detail-icon
      :src="overallDifficultyIcon"
      alt="overall difficulty icon"
      :value="(+overallDifficulty).toFixed(2)"
      class="white-text"
    />
    <detail-icon
      :src="approachRateIcon"
      alt="approach rate icon"
      :value="(+approachRate).toFixed(2)"
      class="white-text"
    />
    <detail-icon
      :src="playDifficultyIcon"
      alt="play difficulty icon"
      :value="+stars"
      class="white-text"
    />
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import detailIcon from "./detail-icon.vue";

const icons = {
  durationIcon: require("~/assets/images/playDetails/duration.png"),
  bpmIcon: require("~/assets/images/playDetails/bpm.png"),
  comboIcon: require("~/assets/images/playDetails/combo.png"),
  circleSizeIcon: require("~/assets/images/playDetails/circleSize.png"),
  healthPointsIcon: require("~/assets/images/playDetails/healthPoints.png"),
  overallDifficultyIcon: require("~/assets/images/playDetails/overallDifficulty.png"),
  approachRateIcon: require("~/assets/images/playDetails/approachRate.png"),
  playDifficultyIcon: require("~/assets/images/playDetails/playDifficulty.png"),
};

export default Vue.extend({
  components: {
    detailIcon,
  },
  props: {
    bpm: Number,
    combo: Number,
    duration: String,
    circleSize: Number,
    hpDrain: Number,
    overallDifficulty: Number,
    approachRate: Number,
    stars: Number,
  },
  data() {
    return {
      ...icons,
    };
  },
});
</script>
