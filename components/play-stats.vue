<template>
  <div>
    <h1
      v-if="!small"
      class="ml-2 text-2xl leading-tight md:mb-1 gold-text md:ml-0"
    >
      {{ Math.ceil(+playPP) }}pp
    </h1>
    <div class="ml-2 whitespace-no-wrap md:mb-1 md:ml-0">
      <span v-if="small" class="whitespace-no-wrap gold-text">
        {{ (+playAccuracy).toFixed(2) }}%
      </span>
      <rank :rank="rank" :class="['inline', small ? 'w-8 ml-2' : 'w-16']" />
    </div>
    <div class="ml-2 whitespace-no-wrap md:mb-1 md:ml-0">
      <mod
        v-for="mod in mods.split(/\s*,\s*/)"
        :mod="mod"
        :key="mod"
        :class="['inline', small ? 'w-6' : 'w-10']"
      />
    </div>
    <div class="ml-2 whitespace-no-wrap md:mb-1 md:ml-0">
      <span class="whitespace-no-wrap white-text">
        <span class="blue-text">{{ counts300 }}</span> /
        <span class="green-text">{{ counts100 }}</span> /
        <span class="gold-text">{{ counts50 }}</span> /
        <span class="red-text">{{ countsMiss }}</span>
      </span>
      <span v-if="small" class="ml-2 leading-tight md:mb-1 gold-text md:ml-0">
        {{ Math.ceil(+playPP) }}pp
      </span>
    </div>
    <div v-if="!small" class="text-xl whitespace-no-wrap gold-text ">
      {{ (+playAccuracy).toFixed(2) }}%
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: [
    "playPP",
    "rank",
    "mods",
    "counts300",
    "counts100",
    "counts50",
    "countsMiss",
    "playAccuracy",
    "small"
  ]
});
</script>
