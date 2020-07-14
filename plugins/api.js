import apiFactory from "~/src/api.service";

export default function(ctx, inject) {
  const api = apiFactory(ctx.$http);
  inject("api", api);
}
