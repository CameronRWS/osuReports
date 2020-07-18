/**
 * @param {import('@nuxt/http').NuxtHTTPInstance} $http
 * @param {string} baseUrl
 */
export default ($http, baseUrl) => {
  $http.setHeader("x-requested-with", "XMLHttpRequest");
  if (!baseUrl) baseUrl = "";

  return {
    getStats: async () => $http.$get(`${baseUrl}/api/stats`),
    getPlayerInfo: async () => $http.$get(`${baseUrl}/api/player`),
    getPlayerSessions: async () => $http.$get(`${baseUrl}/api/player/sessions`),
    logout: async () => $http.post(`${baseUrl}/logout`)
  };
};
