export const state = () => ({
  player: null
});

export const mutations = {
  setPlayer(state, player) {
    state.player = player;
  }
};
