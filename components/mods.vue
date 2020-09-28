<template>
  <div class="flex flex-wrap items-center mods">
    <mod v-for="mod in modList" :key="mod" :mod="mod" class="w-6 mr-1 " />
  </div>
</template>

<script lang="ts">
import Mod from '~/components/mod.vue' 
import Vue from 'vue'

export default Vue.extend({
  components: {
    Mod
  },
  props: ['mods'],
  computed: {
    modList(): string[] {
      return this.mods.split(/\s*,\s*/).filter(mod => mod.trim() !== "");
    },
    style(): Record<string, string> {
      return {

      }
    }
  }
})
</script>

<style lang="postcss" scoped>
.mods {
  flex-basis: 100%;
}
</style>