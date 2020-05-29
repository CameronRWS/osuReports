const Redis = require("ioredis");
const _ = require("lodash");
const globalInstances = require("./globalInstances");
const axios = require("axios").default;
const { gzip, gunzip } = require("zlib");
const { promisify } = require("util");
const osuApi = require("./osuApi");

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const fetchBeatmap = (beatmapId) =>
  axios
    .get(`https://osu.ppy.sh/osu/${beatmapId}`)
    .then((resp) => resp.data)
    .catch((err) => {
      globalInstances.logMessage(`Could not get beatmap id ${beatmapId}`, err);
      return null;
    });

const ts = () => new Date().getTime().toString();

const infoKey = (beatmapId) => `beatmap:${beatmapId}:info`;
const dataKey = (beatmapId) => `beatmap:${beatmapId}:data`;
const lruKey = "lru:beatmap";

const lruUpdate = `
    -- Keys: lruKey
    -- Args: member maxSize
    local curSize = redis.call('zcard', KEYS[1])
    local evicted = nil

    if curSize == ARGV[2] then
      evicted = redis.call('zpopmin', KEYS[1])
    end

`;

class BeatmapCache {
  constructor(options) {
    this.options = _.merge(
      {
        redis: {
          host: "localhost",
          port: 6379,
          showFriendlyErrorStack: true,
        },
        maxSize: 512,
      },
      options
    );

    this.client = new Redis(options.redis);
  }

  async getBeatmapData(beatmapId) {
    const [[, nch], [, data]] = await this.client
      .multi()
      .zadd(lruKey, "XX", "CH", ts(), beatmapId)
      .exec();
    if (nch && data !== null) {
      const uncompressed = await gunzipAsync(data);
      return uncompressed;
    }
    if (nch) {
    }

    const beatmap = await fetchBeatmap(beatmapId);
    if (beatmap === null)
      throw new Error(`no such beatmap exists: ${beatmapId}`);

    const compressed = await gzipAsync(beatmap);
    await this.client.setBuffer(dataKey(beatmapId), compressed);

    return beatmap;
  }

  async getBeatmapInfo(beatmapId) {
    const info = await this.client.get(infoKey(beatmapId));
    if (info !== null) return JSON.parse(info);

    const [beatmap] = await osuApi.getBeatmaps({
      b: beatmapId,
      m: 0,
    });
    if (!beatmap) throw new Error(`no such beatmap exists: ${beatmapId}`);

    await this.client.set(infoKey(beatmapId), JSON.stringify(beatmap));
    return beatmap;
  }
}

module.exports = new BeatmapCache({
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
