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
  return new Date(osuDate.getTime() - osuDate.getTimezoneOffset() * 60000);
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

  handleScoreWithSession(score) {
    //if the session object exists AND play was made within the hour AND this play is different than the last recorded play, add new play to the session object.
    if (score.rank == "F") {
      //console.log(this.osuUsername + " " + this.twitterUsername + " - Play added via API");
      this.sessionObject.addNewPlayAPI(score); //IF ITS AN UNCOMPLETE PLAY
    } else {
      return fetchScoresFromProfile(this.osuUsername)
        .then((data) => {
          var scoreOfRecentPlay = data.scoresRecent[0];
          if (score.score == scoreOfRecentPlay.score) {
            //console.log(this.osuUsername + " " + this.twitterUsername + " - Play added via WEB");
            this.sessionObject.addNewPlayWEB(scoreOfRecentPlay); //IF ITS A COMPLETE PLAY
          } else {
            //console.log(this.osuUsername + " " + this.twitterUsername + " - Play added via API (scores don't match, thus it wasn't good enough to be on website)");
            this.sessionObject.addNewPlayAPI(score); //IF ITS AN UNCOMPLETE PLAY
          }
        })
        .catch((error) => {
          globalInstances.logMessage(error);
        });
    }
  }

  handleSessionTimeout() {
    //if the session object exists AND the last play is more than 60 minutes old, end the session and reset the session object variable.
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
    let fixedTime = fixOsuDate(score.date).getTime();

    let lastPlay = this.sessionObject.playObjects[
      this.sessionObject.playObjects.length - 1
    ];
    let lastPlayTime = fixOsuDate(lastPlay.date).getTime();

    return fixedTime != lastPlayTime;
  }

  handleScore(score) {
    var mostRecentPlayTime = fixOsuDate(score.date);
    var minutesElapsed = calculateElapsedTime(mostRecentPlayTime);
    //console.log(this.osuUsername + " " + this.twitterUsername + " - Time since last play: " + minutesElapsed.toFixed(2) + " minutes");

    if (minutesElapsed > globalInstances.sessionTimeout) {
      return this.handleSessionTimeout();
    }
    if (this.sessionObject == undefined) {
      this.sessionObject = new sessionObject(this, false); //IF ITS A COMPLETE PLAY
      return this.handleScoreWithSession(score);
    }
    if (this.isNewPlay(score)) {
      //console.log(this.osuUsername + " " + this.twitterUsername + " - Session is in progress, plays in session: " + this.sessionObject.playObjects.length);
      //console.log((mostRecentPlayTime.getTime() + 28800000) + " " + this.sessionObject.playObjects[(this.sessionObject.playObjects.length) - 1].date.getTime());
      return this.handleScoreWithSession(score);
    }

    // we have no updates, so just exit here
  }

  updateSessionObjectv3() {
    osuApi
      .getUserRecent({ u: this.osuUsername })
      .then((scores) => {
        if (scores.length === 0) {
          globalInstances.logMessage("no scores found in response");
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
        globalInstances.logMessage(error);
      });
  }
}

module.exports = playerObject;
