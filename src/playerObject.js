var osuApi = require("./osuApi");
var globalInstances = require("./globalInstances");
var sessionObject = require("./sessionObject");
var axios = require("axios");
var cheerio = require("cheerio");

function fetchScoresFromProfile(profileId) {
  const url = "https://osu.ppy.sh/users/" + profileId + "/osu";
  return axios.get(url).then((response) => {
    var $ = cheerio.load(response.data);
    var html = $("#json-extras").html();
    return JSON.parse(html);
  });
}

// Times returned from the OSU api are parsed according to the local timezone.
// This causes the time to appear further ahead than it actually is (assuming
// you're in the western hemsiphere). To fix this, we subtract our current
// timezone offset from the parsed date to return it to proper UTC.
function fixOsuDate(osuDate) {
  return new Date(
    osuDate.getTime() + (osuDate.getTimezoneOffset() + 180) * 60000
  );
}

// Return the elapsed time between now and the last play, in minutes
function calculateElapsedTime(lastPlay) {
  let now = new Date();
  return (now.getTime() - lastPlay.getTime()) / 60000;
}

class playerObject {
  constructor(osuUsername, twitterUsername) {
    this.osuUsername = osuUsername;
    this.twitterUsername = twitterUsername;
    this.sessionObject;
  }

  updateSessionObjectv3() {
    osuApi
      .getUserRecent({ u: this.osuUsername })
      .then((scores) => {
        if (scores.length === 0) {
          globalInstances.logMessage(
            "updateSessionObjectv3(): no scores found in response"
          );
          return;
        }
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
        // globalInstances.logMessage(
        //   "updateSessionObjectv3(): No new scores to look at"
        // );
      });
  }

  handleScore(score) {
    var mostRecentPlayTime = fixOsuDate(score.date);
    // console.log(mostRecentPlayTime);
    var minutesElapsed = calculateElapsedTime(mostRecentPlayTime);
    console.log("minutes: " + minutesElapsed);
    if (
      minutesElapsed > globalInstances.sessionTimeout &&
      this.sessionObject != undefined
    ) {
      console.log("here1");
      return this.handleSessionTimeout();
    }
    if (
      minutesElapsed < globalInstances.sessionTimeout &&
      this.sessionObject == undefined
    ) {
      console.log("here2");
      this.sessionObject = new sessionObject(this, false);
      return this.handleScoreWithSession(score);
    }
    if (this.isNewPlay(score)) {
      console.log("here3");
      return this.handleScoreWithSession(score);
    }
    // we have no updates, so just exit here
  }

  handleScoreWithSession(score) {
    if (score.rank == "F") {
      this.sessionObject.addNewPlayAPI(score);
    } else {
      return fetchScoresFromProfile(this.osuUsername)
        .then((data) => {
          var scoreOfRecentPlay = data.scoresRecent[0];
          if (score.score == scoreOfRecentPlay.score) {
            this.sessionObject.addNewPlayWEB(scoreOfRecentPlay);
          } else {
            this.sessionObject.addNewPlayAPI(score);
          }
        })
        .catch((error) => {
          globalInstances.logMessage(error);
        });
    }
  }

  handleSessionTimeout() {
    if (!globalInstances.isSessionEnding) {
      globalInstances.isSessionEnding = true;
      try {
        this.sessionObject.endSession();
      } catch (err) {
        globalInstances.logMessage(
          "Critical Error: Problem occured when ending session - " + err + "\n"
        );
      }
      this.sessionObject = undefined;
      globalInstances.isSessionEnding = false;
    }
  }

  isNewPlay(score) {
    let attemptedNewPlayTime = fixOsuDate(score.date).getTime();

    let lastPlay = this.sessionObject.playObjects[
      this.sessionObject.playObjects.length - 1
    ];
    let lastRecordedPlayTime =
      fixOsuDate(lastPlay.date).getTime() - 480 * 60000;
    return attemptedNewPlayTime != lastRecordedPlayTime;
  }

  createFakeSession() {
    const url = "https://osu.ppy.sh/users/" + this.osuUsername;
    var scoreOfRecentPlay;
    axios.get(url).then((response) => {
      var $ = cheerio.load(response.data);
      var html = $("#json-extras").html();
      var data = JSON.parse(html);
      scoreOfRecentPlay = data.scoresBest;
      this.sessionObject = new sessionObject(this, true);
      // add more if necessary
      this.sessionObject.addNewPlayWEB(scoreOfRecentPlay[0]);
    });
  }
}

module.exports = playerObject;
