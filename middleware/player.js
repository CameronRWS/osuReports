/**
 * @param {import("@nuxt/types").Context} context
 */
export default async function(context) {
  const { $api, store } = context.app;

  let player;
  try {
    player = await $api.getPlayerInfo();
  } catch (err) {
    if (err.statusCode !== 401) throw err;
  }

  store.commit("setPlayer", player);
}
