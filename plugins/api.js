import apiFactory from "~/src/api.service";

export default function({ $http, $config }, inject) {
  const api = apiFactory($http, $config.baseUrl);
  inject("api", api);
}
