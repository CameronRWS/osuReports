export const state = () => ({
  player: null
});

export const mutations = {
  setPlayer(state, player) {
    state.player = player;
  }
};

export const actions = {
  async nuxtServerInit({ commit }, { req, app: { $api } }) {
    if (req.session?.passport?.user) {
      const player = await $api.getPlayerInfo();
      commit("setPlayer", player);
    }
  },
  logout({ commit }) {
    commit("setPlayer", null);
  }
};
