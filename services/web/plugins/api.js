import apiFactory from "~/src/api.service";

export default function({ $http }, inject) {
  const api = apiFactory($http);
  inject("api", api);
}
