export const state = () => ({
  player: null,
  stats: null,
  flash: []
});

export const mutations = {
  setPlayer(state, player) {
    state.player = player;
  },
  setStats(state, stats) {
    state.stats = stats;
  },
  setFlash(state, flash) {
    state.flash = flash;
  }
};

export const actions = {
  async nuxtServerInit({ commit }, { req, res, app: { $api } }) {
    console.dir(req);
    if (req?.user) {
      const player = await $api.getPlayerInfo();
      commit("setPlayer", player);
    }
    const stats = await $api.getStats();
    commit("setStats", stats);
    commit("setFlash", [...res.flashes]);

    res.clearFlashes();
  },
  logout({ commit }) {
    commit("setPlayer", null);
  }
};
