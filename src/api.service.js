export default $http => ({
  getStats: async () => $http.$get("/api/stats"),
  getPlayerInfo: async () => $http.$get("/api/player"),
  getPlayerSessions: async () => $http.$get("/api/player/sessions"),
  logout: async () => $http.post("/logout")
});
