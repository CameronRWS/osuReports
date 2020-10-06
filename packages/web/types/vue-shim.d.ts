import Vue from "vue";
import apiFactory from "~/src/api.service";

declare module "*.vue" {
  export default Vue;
}

declare module "vue/types/vue" {
  interface Vue {
    $api: ReturnType<typeof apiFactory>;
  }
}
