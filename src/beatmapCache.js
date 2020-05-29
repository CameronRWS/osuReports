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

// This lua script removes the lowest value in the sorted set and replaces it with
// the new member when the LRU is full. Otherwise, it just inserts the member.
const lruUpdate = `
    -- Keys: lruKey
    -- Args: member ts maxSize
    local lruKey = KEYS[1]
    local member, ts, maxSize = ARGV[1], tonumber(ARGV[2]), tonumber(ARGV[3])
    local curSize = redis.call('zcard', lruKey)
    local evicted = nil

    if curSize == maxSize then
      evicted = redis.call('zpopmin', lruKey)
    end

    redis.call('zadd', lruKey, ts, member)

    return evicted
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
    this.client.defineCommand("lruUpdate", {
      numberOfKeys: 1,
      lua: lruUpdate,
    });

    this.hit = 0;
    this.miss = 0;
  }

  async lruUpdate(beatmapId) {
    const evicted = await this.client.lruUpdate(
      lruKey,
      beatmapId,
      ts(),
      this.options.maxSize
    );
    if (evicted) {
      await this.client.del(dataKey(evicted), infoKey(evicted));
    }
  }

  async getBeatmapData(beatmapId) {
    const [[, nch], [, data]] = await this.client
      .pipeline()
      .zadd(lruKey, "XX", "CH", ts(), beatmapId)
      .getBuffer(dataKey(beatmapId))
      .exec();
    if (nch && data !== null) {
      this.hit++;
      const uncompressed = await gunzipAsync(data);
      return uncompressed;
    }
    // key missing from LRU but still in redis
    if (!nch) await this.client.del(dataKey(beatmapId), infoKey(beatmapId));

    this.miss++;

    const beatmap = await fetchBeatmap(beatmapId);
    if (beatmap === null)
      throw new Error(`no such beatmap exists: ${beatmapId}`);

    const compressed = await gzipAsync(beatmap);
    await this.lruUpdate(beatmapId);
    await this.client.setBuffer(dataKey(beatmapId), compressed);

    return beatmap;
  }

  async getBeatmapInfo(beatmapId) {
    const [[, nch], [, info]] = await this.client
      .pipeline()
      .zadd(lruKey, "XX", "CH", ts(), beatmapId)
      .get(infoKey(beatmapId))
      .exec();
    if (nch && info !== null) {
      this.hit++;
      return JSON.parse(info);
    }
    if (!nch) this.client.del(dataKey(beatmapId), infoKey(beatmapId));

    this.miss++;

    const [beatmap] = await osuApi.getBeatmaps({
      b: beatmapId,
      m: 0,
    });
    if (!beatmap) throw new Error(`no such beatmap exists: ${beatmapId}`);

    await this.lruUpdate(beatmapId);
    await this.client.set(infoKey(beatmapId), JSON.stringify(beatmap));
    return beatmap;
  }

  getHitRatio() {
    const attempts = this.hit + this.miss;
    return attempts > 0 ? this.hit / attempts : 0;
  }
}

module.exports = new BeatmapCache({
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
