import Redis from "ioredis";
import _ from "lodash";
import osuApi from "../instances/osuApi";

const USER_PREFIX = "usercache:";
const USER_CACHE_TIME = 24 * 60 * 60;

type UserForm = "username" | "id";
type CacheOptions = {
  host?: string;
  port?: string | number;
  showFriendlyErrorStack?: boolean;
} & Redis.RedisOptions;

class Cache {
  protected client: Redis.Redis;

  constructor(options: CacheOptions) {
    options = _.merge(
      {
        host: "localhost",
        port: 6379,
        showFriendlyErrorStack: true
      },
      options
    );

    this.client = new Redis(options);
  }

  /**
   * @param {any} osuUsernameOrId - the osu user name or user id that needs to be converted
   * @param {UserForm} requestedForm - boolean for telling the function what the requested form is
   */

  async convertOsuUser(
    osuUsernameOrId: string | number,
    requestedForm: UserForm
  ) {
    return osuApi
      .getUser({ u: osuUsernameOrId.toString() })
      .then(user => (requestedForm === "id" ? user.id : user.name))
      .catch(err => {
        console.error("Failed to fetch user information", err);
        return null;
      });
  }

  async getOsuUser(osuId: string | number) {
    const key = USER_PREFIX + osuId;

    let username;
    try {
      username = await this.client.get(key);
      if (username !== null) {
        return username;
      }
    } catch (ex) {}

    // not cached
    username = await this.convertOsuUser(osuId, "username");
    await this.client.setex(key, USER_CACHE_TIME, username);
    return username;
  }

  async updateOsuUser(osuId, osuUsername) {
    const key = USER_PREFIX + osuId;
    await this.client.setex(key, USER_CACHE_TIME, osuUsername);
  }
}

export = new Cache({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : undefined
});
