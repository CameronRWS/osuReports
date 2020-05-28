/**
 * @typedef {import('node-osu/lib/base/Score')} Score
 * @typedef {import('node-osu/lib/base/Beatmap')} Beatmap
 */

var osuApi = require("./osuApi");
var globalInstances = require("./globalInstances");
var sessionObject = require("./sessionObject");
var axios = require("axios").default;
var cheerio = require("cheerio");
const sessionStore = require("./sessionStore");
var UserCache = require("./userCache");

// Return the elapsed time between now and the last play, in minutes
function calculateElapsedTime(lastPlay) {
  let now = new Date();
  return (now.getTime() - lastPlay.getTime()) / 60000;
}

class NoMoreScores extends Error {}

/**
 * @class
 */
class playerObject {
  constructor(osuUsername, twitterUsername) {
    /** @type {string} */
    this.osuUsername = osuUsername;
    /** @type {string} */
    this.twitterUsername = twitterUsername;
    /** @type {sessionObject | undefined} */
    this.sessionObject;
  }

  async recentScores() {
    try {
      const recentScores = await osuApi.getUserRecent({ u: this.osuUsername });
      return recentScores;
    } catch (error) {
      // no new scores
      return [];
    }
  }

  async updateSessionObjectv3() {
    const scores = await this.recentScores();
    for (const [i, score] of scores.entries()) {
      if (i === 0) {
        // check to see if the latest score is out of range
        const minutesElapsed = calculateElapsedTime(score.date);
        if (minutesElapsed > globalInstances.sessionTimeout) {
          if (this.sessionObject !== undefined) {
            const osuUsername = await UserCache.getOsuUser(this.osuUsername);
            globalInstances.logMessage(`Ending session for: ${osuUsername}`);
            return this.handleSessionTimeout();
          }
          return;
        }
      }

      try {
        //m: 0 is for standard osu! mode
        const [beatmap] = await osuApi.getBeatmaps({
          b: score.beatmapId,
          m: 0,
        });
        if (!beatmap) return;
        await this.handleScore(score, beatmap);
      } catch (err) {
        if (err instanceof NoMoreScores) break;
        globalInstances.logMessage(
          "updateSessionObjectv3(): Something went wrong: ",
          err
        );
      }
    }
  }

  /**
   * @param {Score} score
   * @param {Beatmap} beatmap
   */
  async handleScore(score, beatmap) {
    const osuUsername = await UserCache.getOsuUser(this.osuUsername);

    if (this.sessionObject === undefined) {
      globalInstances.logMessage(`Creating new session for: ${osuUsername}`);
      this.sessionObject = new sessionObject(this);
      await this.sessionObject.initialize();
    }

    if (this.isNewPlay(score)) {
      globalInstances.logMessage(`Adding new play for: ${osuUsername}`);
      await this.sessionObject.addNewPlay(score, beatmap);
      return sessionStore.storeSession(this.sessionObject);
    }

    // we have no updates, so throw the signal error to break out of the scores loop
    throw new NoMoreScores();
  }

  async handleSessionTimeout() {
    if (!globalInstances.isSessionEnding) {
      globalInstances.isSessionEnding = true;
      try {
        await this.sessionObject.endSession();
        this.sessionObject = undefined;
        await sessionStore.deleteSession(this);
      } catch (err) {
        globalInstances.logMessage(
          "Critical Error: Problem occured when ending session - ",
          err
        );
      }
      globalInstances.isSessionEnding = false;
    }
  }

  /**
   * @param {Score} score
   */
  isNewPlay(score) {
    // this isn't supposed to happen
    if (!this.sessionObject) return false;
    if (!this.sessionObject.playObjects.length) return true;

    // since we now look back on scores, let's just stop when they're older than the timeout
    // stored sessions should catch them if we restarted
    const age = calculateElapsedTime(score.date);
    if (age > globalInstances.sessionTimeout) return false;

    let attemptedNewPlayTime = score.date.getTime();
    return !this.sessionObject.playObjects
      .map((p) => new Date(p.date).getTime())
      .includes(attemptedNewPlayTime);
  }

  async createFakeSession() {
    const url = "https://osu.ppy.sh/users/" + this.osuUsername;
    var scoreOfRecentPlay;
    const waitSeconds = (seconds) =>
      new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    return axios.get(url).then(async (response) => {
      var $ = cheerio.load(response.data);
      var html = $("#json-extras").html();
      var data = JSON.parse(html);
      scoreOfRecentPlay = data.scoresBest;
      this.sessionObject = new sessionObject(this);
      await this.sessionObject.initializeDebug();
      // add more if necessary
      // for (let i = 0; i < 6; i++) {
      //   if (i < 5) {
      //     await this.sessionObject.addNewPlayAPI(scoreOfRecentPlay[i]);
      //   } else {
      //     this.sessionObject.playObjects.push(
      //       this.sessionObject.playObjects[i % 5]
      //     );
      //   }
      // }
    });
  }
}

module.exports = playerObject;
