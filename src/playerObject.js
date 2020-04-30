var osuApi = require('./osuApi');
var globalInstances = require('./globalInstances');
var sessionObject = require('./sessionObject');
var axios = require('axios');
var cheerio = require('cheerio');

class playerObject {

    constructor(osuUsername, twitterUsername) {
        this.osuUsername = osuUsername;
        this.twitterUsername = twitterUsername;
        this.sessionObject;
    }

    createFakeSession() {
        const url = "https://osu.ppy.sh/users/" + this.osuUsername;
        var scoreOfRecentPlay;
        axios.get(url)
            .then(response => {
                var $ = cheerio.load(response.data);
                var html = $("#json-extras").html();
                var data = JSON.parse(html);
                scoreOfRecentPlay = data.scoresBest;
                this.sessionObject = new sessionObject(this.osuUsername, this.twitterUsername, scoreOfRecentPlay, true)
            })
    }

    updateSessionObjectv3() {
        osuApi.getUserRecent({ u: this.osuUsername })
            .then(scores => {
                osuApi.getBeatmaps({ b: scores[0].beatmapId }).then(beatmaps => {
                    if (beatmaps[0].mode == 'Standard') {
                        var currentTime = new Date();
                        var mostRecentPlayTime = scores[0].date;
                        var minutesElapsed = currentTime.getTime() / 60000 - (mostRecentPlayTime.getTime() / 60000) - 480
                        //console.log(this.osuUsername + " " + this.twitterUsername + " - Time since last play: " + minutesElapsed.toFixed(2) + " minutes");
                        if (this.sessionObject == undefined) {
                            if (minutesElapsed < globalInstances.sessionTimeout) {
                                if (scores[0].rank == "F") {
                                    this.sessionObject = new sessionObject(this.osuUsername, this.twitterUsername, scores[0], false) //IF ITS AN UNCOMPLETE PLAY
                                } else {
                                    const url = 'https://osu.ppy.sh/users/' + this.osuUsername + '/osu';
                                    //console.log(url);
                                    var scoreOfRecentPlay;
                                    axios.get(url)
                                        .then(response => {
                                            var $ = cheerio.load(response.data);
                                            var html = $("#json-extras").html();
                                            var data = JSON.parse(html);
                                            //console.log(data.scoresRecent[0]);
                                            scoreOfRecentPlay = data.scoresRecent[0];
                                            if (scores[0].score = scoreOfRecentPlay.score) {
                                                this.sessionObject = new sessionObject(this.osuUsername, this.twitterUsername, scoreOfRecentPlay, false) //IF ITS A COMPLETE PLAY
                                            } else {
                                                this.sessionObject = new sessionObject(this.osuUsername, this.twitterUsername, scores[0], false) //IF ITS AN UNCOMPLETE PLAY
                                            }
                                        })
                                        .catch(error => {
                                            globalInstances.logMessage(error);
                                        })
                                }
                            }
                        }
                        else {
                            //console.log(this.osuUsername + " " + this.twitterUsername + " - Session is in progress, plays in session: " + this.sessionObject.playObjects.length);
                            //console.log((mostRecentPlayTime.getTime() + 28800000) + " " + this.sessionObject.playObjects[(this.sessionObject.playObjects.length) - 1].date.getTime());
                            if (minutesElapsed < globalInstances.sessionTimeout && (mostRecentPlayTime.getTime() + 28800000) != this.sessionObject.playObjects[(this.sessionObject.playObjects.length) - 1].date.getTime()) {
                                //if the session object exists AND play was made within the hour AND this play is different than the last recorded play, add new play to the session object.
                                if (scores[0].rank == "F") {
                                    //console.log(this.osuUsername + " " + this.twitterUsername + " - Play added via API");
                                    this.sessionObject.addNewPlayAPI(scores[0]); //IF ITS AN UNCOMPLETE PLAY
                                } else {
                                    const url = "https://osu.ppy.sh/users/" + this.osuUsername + '/osu';
                                    var scoreOfRecentPlay;
                                    axios.get(url)
                                        .then(response => {
                                            var $ = cheerio.load(response.data);
                                            var html = $("#json-extras").html();
                                            var data = JSON.parse(html);
                                            scoreOfRecentPlay = data.scoresRecent[0];
                                            if (scores[0].score = scoreOfRecentPlay.score) {
                                                //console.log(this.osuUsername + " " + this.twitterUsername + " - Play added via WEB");
                                                this.sessionObject.addNewPlayWEB(scoreOfRecentPlay); //IF ITS A COMPLETE PLAY
                                            } else {
                                                //console.log(this.osuUsername + " " + this.twitterUsername + " - Play added via API (scores don't match, thus it wasn't good enough to be on website)");
                                                this.sessionObject.addNewPlayAPI(scores[0]); //IF ITS AN UNCOMPLETE PLAY
                                            }
                                        })
                                        .catch(error => {
                                            globalInstances.logMessage(error);
                                        })
                                }
                            } else if (minutesElapsed > globalInstances.sessionTimeout) {
                                //if the session object exists AND the last play is more than 60 minutes old, end the session and reset the session object variable.
                                if (!globalInstances.isSessionEnding) {
                                    globalInstances.isSessionEnding = true;
                                    try {
                                        this.sessionObject.endSession();
                                    } catch (err) {
                                        globalInstances.logMessage("Error: Problem occured when ending session - " + err + "\n")
                                    }
                                    this.sessionObject = undefined;
                                    globalInstances.isSessionEnding = false;
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                globalInstances.logMessage(error);
            })
    }
}

module.exports = playerObject;