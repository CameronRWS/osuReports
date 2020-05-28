var osu = require("node-osu");
var keys = require("./consumerKeys");

var osuApi = new osu.Api(keys.osuApi_key, {
  // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
  notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
  completeScores: false, // When fetching scores also return the beatmap (default: false)
  parseNumeric: true,
});

module.exports = osuApi;
