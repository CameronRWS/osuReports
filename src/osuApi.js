var osu = require("node-osu");
var keys = require("./consumerKeys");
const { isFunction } = require("lodash");
const { osuApiCalls } = require("./metrics");

var osuApi = new osu.Api(keys.osuApi_key, {
  // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
  notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
  completeScores: false, // When fetching scores also return the beatmap (default: false)
  parseNumeric: true,
});

const proxy = new Proxy(osuApi, {
  get(target, key) {
    const thing = target[key];
    if (!thing || !isFunction(thing)) return thing;
    return (...args) => {
      osuApiCalls.inc();
      return thing(...args);
    };
  },
});

module.exports = proxy;
