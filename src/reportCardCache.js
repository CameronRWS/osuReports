const Redis = require("ioredis");
const Jimp = require("jimp");
const _ = require("lodash");
const ReportCardGenerator = require("./reportCardGenerator");

const USER_PREFIX = "reportcardcache:";
const USER_CACHE_TIME = 24 * 60 * 60;

class ReportCardCache {
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
    reportCard = await ReportCardGenerator.generateReportCard(sessionId);
    const reportCardData = await reportCard.getBufferAsync(Jimp.MIME_PNG);
    await this.client.setex(key, USER_CACHE_TIME, reportCardData);
    return reportCardData;
  }
}

module.exports = new ReportCardCache({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
