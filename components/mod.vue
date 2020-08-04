<template>
  <img :alt="`mod ${mod}`" :src="src" />
</template>

<script>
// @ts-ignore
import DT from "~/assets/images/mods/mod_double-time.png";
// @ts-ignore
import EZ from "~/assets/images/mods/mod_easy.png";
// @ts-ignore
import FL from "~/assets/images/mods/mod_flashlight.png";
// @ts-ignore
import HT from "~/assets/images/mods/mod_half-time.png";
// @ts-ignore
import HR from "~/assets/images/mods/mod_hard-rock.png";
// @ts-ignore
import HD from "~/assets/images/mods/mod_hidden.png";
// @ts-ignore
import NC from "~/assets/images/mods/mod_nightcore.png";
// @ts-ignore
import NF from "~/assets/images/mods/mod_no-fail.png";
// @ts-ignore
import PF from "~/assets/images/mods/mod_perfect.png";
// @ts-ignore
import SD from "~/assets/images/mods/mod_sudden-death.png";

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
  SD
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
