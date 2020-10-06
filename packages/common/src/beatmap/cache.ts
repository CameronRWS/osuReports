import Redis from "ioredis";
import { merge } from "lodash";
import axios from "axios";
import { gzip, gunzip, InputType } from "zlib";
import { promisify } from "util";
import osu from "../instances/osuApi";
import { randomBytes } from "crypto";
import { beatmapCacheStats } from "../metrics";

const randomBytesAsync = promisify(randomBytes);
const gzipAsync = promisify(gzip) as (buf: InputType) => Promise<Buffer>;
const gunzipAsync = promisify(gunzip);

const fetchBeatmap = beatmapId =>
  axios
    .get(`https://osu.ppy.sh/osu/${beatmapId}`)
    .then(resp => resp.data)
    .catch(err => {
      console.error(`Could not get beatmap id ${beatmapId}`, err);
      return null;
    });

const ts = () => new Date().getTime().toString();
const sleepSome = async () => new Promise(resolve => setTimeout(resolve, 5));
const getSentinel = async () => (await randomBytesAsync(8)).toString("base64");

const infoKey = beatmapId => `beatmap:${beatmapId}:info`;
const dataKey = beatmapId => `beatmap:${beatmapId}:data`;
const lruKey = "lru:beatmap";
const lockKey = `lru:lock:beatmap`;
const lockTime = 5000;

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
      if evicted ~= nil then
        evicted = evicted[1]
      end
    end

    redis.call('zadd', lruKey, ts, member)

    return evicted
`;

const checkAndDelete = `
    -- Keys: lock
    -- Args: sentinel
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('del', KEYS[1])
    else
      return 0
    end
`;

type CacheOptions = {
  redis?: Redis.RedisOptions;
  maxSize: number;
};

interface EnhancedCommands {
  lruUpdate(
    lruKey: string,
    member: string,
    timestamp: string,
    maxSize: number
  ): Promise<string | null>;
  checkAndDelete(lock: string, sentinel: string): Promise<string>;
}

class Cache {
  protected client: Redis.Redis & EnhancedCommands;
  protected options: CacheOptions;

  private hit = 0;
  private miss = 0;

  constructor(options: Partial<CacheOptions>) {
    this.options = merge(
      {
        redis: {
          host: "localhost",
          port: 6379,
          showFriendlyErrorStack: true
        },
        maxSize: 512
      },
      options
    );

    this.client = new Redis(options.redis) as any;
    this.client.defineCommand("lruUpdate", {
      numberOfKeys: 1,
      lua: lruUpdate
    });
    this.client.defineCommand("checkAndDelete", {
      numberOfKeys: 1,
      lua: checkAndDelete
    });

    this.hit = 0;
    this.miss = 0;
  }

  incHit() {
    this.hit++;
    beatmapCacheStats.inc({ type: "hit" }, 1);
  }

  incMiss() {
    this.miss++;
    beatmapCacheStats.inc({ type: "miss" }, 1);
  }

  async withLock(cb) {
    const sentinel = await getSentinel();

    // acquire lock
    while (true) {
      const val = await this.client.set(
        lockKey,
        sentinel,
        "PX",
        lockTime,
        "NX"
      );
      if (val === "OK") break;
      await sleepSome();
    }
    try {
      await cb();
    } finally {
      // we can't do a normal check and delete because of race conditions
      const unlocked = await this.client.checkAndDelete(lockKey, sentinel);
      if (unlocked === "0") throw new Error("we lost the lock somehow");
    }
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
      beatmapCacheStats.inc({ type: "eviction" });
    }
  }

  async getBeatmapData(beatmapId) {
    const [[, nch], [, data]] = await this.client
      .pipeline()
      .zadd(lruKey, "XX", "CH", ts(), beatmapId)
      .getBuffer(dataKey(beatmapId))
      .exec();
    if (data !== null) {
      if (nch) {
        this.incHit();
        const uncompressed = await gunzipAsync(data);
        return uncompressed;
      }
      // key missing from LRU but still in redis
      await this.client.del(dataKey(beatmapId), infoKey(beatmapId));
    }
    this.incMiss();

    const beatmap = await fetchBeatmap(beatmapId);
    if (beatmap === null)
      throw new Error(`no such beatmap exists: ${beatmapId}`);

    const compressed: Buffer = await gzipAsync(beatmap);

    await this.withLock(async () => {
      await this.lruUpdate(beatmapId);
      await this.client.setBuffer(dataKey(beatmapId), compressed);
    });

    return beatmap;
  }

  async getBeatmapInfo(beatmapId) {
    const [[, nch], [, info]] = await this.client
      .pipeline()
      .zadd(lruKey, "XX", "CH", ts(), beatmapId)
      .get(infoKey(beatmapId))
      .exec();
    if (info !== null) {
      if (nch) {
        this.incHit();
        return JSON.parse(info);
      }
      await this.client.del(dataKey(beatmapId), infoKey(beatmapId));
    }
    this.incMiss();

    const [beatmap] = await osu.getBeatmaps({
      b: beatmapId,
      m: 0
    });
    if (!beatmap) throw new Error(`no such beatmap exists: ${beatmapId}`);

    await this.withLock(async () => {
      await this.lruUpdate(beatmapId);
      await this.client.set(infoKey(beatmapId), JSON.stringify(beatmap));
    });

    return beatmap;
  }

  getHitRatio() {
    const attempts = this.hit + this.miss;
    return attempts > 0 ? this.hit / attempts : 0;
  }
}

export = new Cache({
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : undefined
  }
});
