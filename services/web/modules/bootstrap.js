import { ProvidePlugin } from "webpack";

/** @type {import('@nuxt/types').Module} */
export default function(moduleOptions) {
  this.extendBuild((config, ctx) => {
    if (ctx.isClient) {
      config.plugins.push(
        new ProvidePlugin({
          $: "jquery"
        })
      );
    }
  });
}
