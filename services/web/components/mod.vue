<template>
  <img :alt="`mod ${mod}`" :src="src" />
</template>

<script>
import DT from "~/assets/images/mods/mod_double-time.png";
import EZ from "~/assets/images/mods/mod_easy.png";
import FL from "~/assets/images/mods/mod_flashlight.png";
import HT from "~/assets/images/mods/mod_half-time.png";
import HR from "~/assets/images/mods/mod_hard-rock.png";
import HD from "~/assets/images/mods/mod_hidden.png";
import NC from "~/assets/images/mods/mod_nightcore.png";
import NF from "~/assets/images/mods/mod_no-fail.png";
import PF from "~/assets/images/mods/mod_perfect.png";
import SD from "~/assets/images/mods/mod_sudden-death.png";
import SO from "~/assets/images/mods/mod_spun-out.png";

const mods = {
  DT,
  EZ,
  FL,
  HT,
  HR,
  HD,
  NC,
  NF,
  PF,
  SD,
  SO
};

export default {
  props: {
    mod: { type: String, validator: mod => Object.keys(mods).includes(mod) }
  },
  computed: {
    src() {
      return mods[this.mod];
    }
  }
};
</script>

<style lang="scss" scoped>
img {
  max-height: 1.5em;
}
</style>
