const Redis = require("ioredis");
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
    console.log(sessionId + " OKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
    const key = USER_PREFIX + sessionId;
    console.log("OK2");
    let reportCard;
    try {
      reportCard = await this.client.get(key);
      if (reportCard !== null) {
        console.log(reportCard);
        return reportCard;
      }
    } catch (ex) {
      console.log(ex);
    }

    // not cached
    reportCard = await ReportCardGenerator.generateReportCard(sessionId);
    console.log("got here");
    await reportCard.writeAsync(`./out/testingCard.png`);
    //store by converting to base64 then back?...? bitch wat
    console.log("got here2");
    await this.client.setex(key, USER_CACHE_TIME, reportCard);
    return reportCard;
  }

  async updateOsuUser(osuId, osuUsername) {
    const key = USER_PREFIX + osuId;
    await this.client.setex(key, USER_CACHE_TIME, osuUsername);
  }
}

module.exports = new ReportCardCache({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
