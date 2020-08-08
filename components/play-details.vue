<template>
  <span class="text-lg white-text">
    <span>
      <img
        class="inline-block h-6 mr-1"
        src="~/assets/images/playDetails/circleSize.png"
        alt="circle size icon"
      />
      <span class="align-middle">{{ (+circleSize).toFixed(2) }}</span>
    </span>
    <span>
      <img
        class="inline-block h-6 mx-1"
        src="~/assets/images/playDetails/healthPoints.png"
        alt="hp drain icon"
      />
      <span class="align-middle">{{ (+hpDrain).toFixed(2) }}</span>
    </span>
    <span>
      <img
        class="inline-block h-6 mx-1"
        src="~/assets/images/playDetails/overallDifficulty.png"
        alt="overall difficulty icon"
      />
      <span class="align-middle">{{ (+overallDifficulty).toFixed(2) }}</span>
    </span>
    <span>
      <img
        class="inline-block h-6 mx-1"
        src="~/assets/images/playDetails/approachRate.png"
        alt="approach rate icon"
      />
      <span class="align-middle">{{ (+approachRate).toFixed(2) }}</span>
    </span>
    <span>
      <img
        class="inline-block h-6 mx-1"
        src="~/assets/images/playDetails/playDifficulty.png"
        alt="play difficulty icon"
      />
      <span class="align-middle">{{ stars }}</span>
    </span>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    circleSize: Number,
    hpDrain: Number,
    overallDifficulty: Number,
    approachRate: Number,
    stars: Number
  }
});
</script>
