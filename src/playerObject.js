var osuApi = require("./osuApi");
var globalInstances = require("./globalInstances");
var sessionObject = require("./sessionObject");
var axios = require("axios").default;
var cheerio = require("cheerio");
const sessionStore = require("./sessionStore");
var UserCache = require("./userCache");

function fetchScoresFromProfile(profileId) {
  const url = "https://osu.ppy.sh/users/" + profileId + "/osu";
  return axios.get(url).then((response) => {
    var $ = cheerio.load(response.data);
    var html = $("#json-extras").html();
    return JSON.parse(html);
  });
}

// Return the elapsed time between now and the last play, in minutes
function calculateElapsedTime(lastPlay) {
  let now = new Date();
  return (now.getTime() - lastPlay.getTime()) / 60000;
}

class NoNewScoresError extends Error {
  constructor(msg) {
    super(msg || "no new scores");
  }
}

class playerObject {
  constructor(osuUsername, twitterUsername) {
    this.osuUsername = osuUsername;
    this.twitterUsername = twitterUsername;
    this.sessionObject;
  }

  async updateSessionObjectv3() {
    return osuApi
      .getUserRecent({ u: this.osuUsername })
      .catch((error) => {
        /* do nothing because we have no new scores */
        throw new NoNewScoresError();
      })
      .then((scores) => {
        return osuApi
          .getBeatmaps({ b: scores[0].beatmapId })
          .then((beatmaps) => {
            if (beatmaps.length === 0) {
              globalInstances.logMessage("beatmap not found");
              return;
            }
            if (beatmaps[0].mode === "Standard") {
              return this.handleScore(scores[0]);
            }
          });
      })
      .catch((error) => {
        if (error instanceof NoNewScoresError) return;
        console.log(error);
        globalInstances.logMessage(
          "updateSessionObjectv3(): Something went wrong: ",
          error
        );
      });
  }

  async handleScore(score) {
    var mostRecentPlayTime = score.date;
    var minutesElapsed = calculateElapsedTime(mostRecentPlayTime);
    // console.log(
    //   "minutesElapsed for " + this.osuUsername + ": " + minutesElapsed
    // );
    let osuUsername = await UserCache.getOsuUser(this.osuUsername);
    if (minutesElapsed > globalInstances.sessionTimeout) {
      if (this.sessionObject !== undefined) {
        console.log("Ending session for: " + osuUsername);
        return this.handleSessionTimeout();
      }
      return;
    }
    if (this.sessionObject === undefined) {
      console.log("Creating new session for: " + osuUsername);
      this.sessionObject = new sessionObject(this, false);
      return this.handleScoreWithSession(score);
    }
    if (this.isNewPlay(score)) {
      console.log("Adding new play for: " + osuUsername);
      return this.handleScoreWithSession(score);
    }
    // we have no updates, so just exit here
  }

  async handleScoreWithSession(score) {
    if (score.rank === "F") {
      this.sessionObject.addNewPlayAPI(score);
    } else {
      const data = await fetchScoresFromProfile(this.osuUsername);
      const scoreOfRecentPlay = data.scoresRecent[0];
      globalInstances.logMessage(
        `Score from API: ${score.score}, score from WEB: ${scoreOfRecentPlay.score}`
      );
      if (+score.score === +scoreOfRecentPlay.score) {
        await this.sessionObject.addNewPlayWEB(scoreOfRecentPlay);
      } else {
        this.sessionObject.addNewPlayAPI(score);
      }
    }

    return sessionStore.storeSession(this.sessionObject);
  }

  async handleSessionTimeout() {
    if (!globalInstances.isSessionEnding) {
      globalInstances.isSessionEnding = true;
      try {
        await this.sessionObject.endSession();
      } catch (err) {
        globalInstances.logMessage(
          "Critical Error: Problem occured when ending session - " + err + "\n"
        );
      }
      this.sessionObject = undefined;
      await sessionStore.deleteSession(this);
      globalInstances.isSessionEnding = false;
    }
  }

  isNewPlay(score) {
    // this isn't supposed to happen
    if (!this.sessionObject) return false;
    if (!this.sessionObject.playObjects.length) return true;

    let attemptedNewPlayTime = score.date.getTime();
    let lastPlay = this.sessionObject.playObjects[
      this.sessionObject.playObjects.length - 1
    ];
    let lastRecordedPlayTime = lastPlay.date.getTime();
    return attemptedNewPlayTime != lastRecordedPlayTime;
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
      this.sessionObject = new sessionObject(this, true);
      // add more if necessary
      for (let i = 0; i < 6; i++) {
        if (i < 5) {
          await this.sessionObject.addNewPlayWEB(scoreOfRecentPlay[i]);
        } else {
          this.sessionObject.playObjects.push(
            this.sessionObject.playObjects[i % 5]
          );
        }
      }
    });
  }
}

module.exports = playerObject;
