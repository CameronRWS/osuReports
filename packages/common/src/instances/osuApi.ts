import Api from "node-osu/lib/Api";
import keys from "../consumerKeys";
import { isFunction } from "lodash";
import { osuApiCalls } from "../metrics";

const osuApi = new Api(keys.osuApi_key, {
  // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
  notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
  completeScores: false, // When fetching scores also return the beatmap (default: false)
  parseNumeric: true
});

const proxy: Api = new Proxy(osuApi, {
  get(target, key) {
    const thing = target[key];
    if (!thing || !isFunction(thing)) return thing;
    return (...args: any[]) => {
      osuApiCalls.inc();
      return thing.bind(target)(...args);
    };
  }
});

export = proxy;
