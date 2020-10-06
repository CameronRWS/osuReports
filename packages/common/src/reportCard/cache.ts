import Redis from "ioredis";
import Jimp from "jimp";
import _ from "lodash";
import Generator from "./generator";

const USER_PREFIX = "reportcardcache:";
const USER_CACHE_TIME = 24 * 60 * 60;

class Cache {
  protected client;

  constructor(options) {
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

  async getReportCard(sessionId) {
    const key = USER_PREFIX + sessionId;
    let reportCard;
    try {
      reportCard = await this.client.getBuffer(key);
      if (reportCard !== null) {
        return reportCard;
      }
    } catch (ex) {
      console.log(ex);
    }
    // not cached
    reportCard = await Generator.generateReportCard(sessionId);
    if (!reportCard) throw new Error("could not generate report card");
    const reportCardData = await reportCard.getBufferAsync(Jimp.MIME_PNG);
    await this.client.setex(key, USER_CACHE_TIME, reportCardData);
    return reportCardData;
  }
}

export = new Cache({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
