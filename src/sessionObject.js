/**
 * @typedef {import('node-osu/lib/base/Score')} Score
 * @typedef {import('node-osu/lib/base/Beatmap')} Beatmap
 */

const osuApi = require("./osuApi");
const ojsama = require("ojsama");
const playObjectv2 = require("./playObjectv2");
const globalInstances = require("./globalInstances");
const jimp = require("jimp");
const util = require("util");
var UserCache = require("./userCache");
const twitterUtils = require("./twitterUtils");

const db = require("./db");
const ReportGenerator = require("./reportGenerator");

const {
  fetchAndParseBeatmap,
  formatDifference,
  sanitizeAndParse,
  secondsToDHMS,
} = require("./utils");

const T = require("./twitterInstance");

class sessionObject {
  constructor(player) {
    this.player = player;
    this.userObjectStartOfSession = null;
    this.userObjectEndOfSession = null;
    /** @type {playObjectv2[]} */
    this.playObjects = [];
    this.sessionID = null;
    this.isDebug = false;
  }

  /**
   * Should be called when starting a new session but not restoring one.
   */
  async initialize() {
    return osuApi
      .getUser({ u: this.player.osuUsername })
      .then((user) => {
        this.userObjectStartOfSession = user;
      })
      .catch((err) => {
        globalInstances.logMessage(err);
      });
  }

  async initializeDebug() {
    globalInstances.logMessage("\ndebug mode init");
    this.isDebug = true;
    return osuApi
      .getUser({ u: this.player.osuUsername })
      .then((user) => {
        this.userObjectStartOfSession = user;
        this.userObjectStartOfSession.pp.rank =
          parseFloat(this.userObjectStartOfSession.pp.rank) + 696;
        this.userObjectStartOfSession.pp.countryRank =
          parseFloat(this.userObjectStartOfSession.pp.countryRank) + 420;
        this.userObjectStartOfSession.accuracy =
          parseFloat(this.userObjectStartOfSession.accuracy) + 53;
        this.userObjectStartOfSession.pp.raw =
          parseFloat(this.userObjectStartOfSession.pp.raw) - 2.0092;
        this.userObjectStartOfSession.counts.plays =
          parseFloat(this.userObjectStartOfSession.counts.plays) - 2;
      })
      .catch((err) => {
        globalInstances.logMessage(" - " + err);
      });
  }

  /**
   * @param {Score} score
   * @param {Beatmap} beatmap
   */
  async addNewPlay(score, beatmap) {
    const map = await fetchAndParseBeatmap(beatmap.id);
    try {
      const stars = new ojsama.diff().calc({ map, mods: score.raw_mods });
      const pp = ojsama.ppv2({
        stars,
        combo: score.maxCombo,
        nmiss: score.counts.miss,
        n300: score.counts["300"],
        n100: score.counts["100"],
        n50: score.counts["50"],
      });
      pp.acc;

      const playObj = new playObjectv2({
        stars,
        pp,
        score,
        map,
        beatmap,
        osuUsername: this.player.osuUsername,
      });

      // keep this list sorted, insert where it's supposed to go
      let i;
      for (i = this.playObjects.length; i > 0; i--) {
        if (score.date.getTime() > this.playObjects[i - 1].date.getTime()) {
          this.playObjects.splice(i, 0, playObj);
          break;
        }
      }
      // if we didn't insert, put it at the front
      if (i === 0) {
        this.playObjects.unshift(playObj);
      }
    } catch (error) {
      globalInstances.logMessage(
        "Err: Problem occured when going to add a play - ",
        error
      );
    }
  }

  async endSession() {
    globalInstances.logMessage(
      "Attempting to end session for: " +
        (await UserCache.getOsuUser(this.player.osuUsername)) +
        "\n"
    );

    // filter Fs
    this.playObjects = this.playObjects.filter((p) => p.rank !== "F");

    //checks to see if there are real plays in session
    let isTweetable = false;
    for (let i = 0; i < this.playObjects.length; i++) {
      if (this.playObjects[i].background !== undefined) {
        isTweetable = true;
        break;
      }
    }
    //change 0 to 1
    if (isTweetable && this.playObjects.length === 1) {
      isTweetable = false;
    }
    if (!isTweetable) {
      const isTweetableResponse =
        this.player.osuUsername +
        " - This session has no plays with a background or only has one play";
      globalInstances.logMessage(isTweetableResponse);
      return;
    }

    const user = await osuApi.getUser({ u: this.player.osuUsername });

    this.userObjectEndOfSession = user;
    const currentTime = new Date();
    const currentTimeForDB = new Date();
    currentTime.setHours(currentTime.getHours() - 6); //setting to central time
    const date = currentTime
      .toLocaleString("en-US", { timeZone: "America/Chicago" })
      .split(",")[0];

    let sessionTotalSeconds = 0;
    if (this.isDebug) {
      sessionTotalSeconds = 1000;
    } else {
      sessionTotalSeconds =
        (this.playObjects[this.playObjects.length - 1].date.getTime() -
          this.playObjects[0].date.getTime()) /
        1000;
    }

    if (
      sessionTotalSeconds < globalInstances.minimalSessionLengthSeconds &&
      sessionTotalSeconds >= 0 &&
      !this.isDebug
    ) {
      const sessionDurationResponse =
        this.player.osuUsername +
        " - This session is not long enough: " +
        sessionTotalSeconds +
        "\n";
      globalInstances.logMessage(sessionDurationResponse);
      return;
    }

    const [
      sessionDurationHours,
      sessionDurationMinutes,
      sessionDurationSeconds,
    ] = secondsToDHMS(sessionTotalSeconds).slice(1);

    const sessionDuration = globalInstances.convertTimeToHMS(
      sessionDurationHours,
      sessionDurationMinutes,
      sessionDurationSeconds
    );

    const fDifGlobalRank =
      sanitizeAndParse(this.userObjectEndOfSession.pp.rank) -
      sanitizeAndParse(this.userObjectStartOfSession.pp.rank);
    const difGlobalRank = formatDifference(fDifGlobalRank * -1);

    const fDifCountryRank =
      sanitizeAndParse(this.userObjectEndOfSession.pp.countryRank) -
      sanitizeAndParse(this.userObjectStartOfSession.pp.countryRank);
    const difCountryRank = formatDifference(fDifCountryRank * -1);

    const fDifLevel =
      sanitizeAndParse(this.userObjectEndOfSession.level) -
      sanitizeAndParse(this.userObjectStartOfSession.level);
    const difLevel = formatDifference(fDifLevel * 100, 0, "%");

    const fDifRankedScore =
      sanitizeAndParse(this.userObjectEndOfSession.scores.ranked) -
      sanitizeAndParse(this.userObjectStartOfSession.scores.ranked);
    const difRankedScore = formatDifference(fDifRankedScore);

    const fDifAcc =
      sanitizeAndParse(this.userObjectEndOfSession.accuracy) -
      sanitizeAndParse(this.userObjectStartOfSession.accuracy);
    const difAcc = formatDifference(fDifAcc, 2, "%");

    const fDifPP =
      sanitizeAndParse(this.userObjectEndOfSession.pp.raw) -
      sanitizeAndParse(this.userObjectStartOfSession.pp.raw);
    const difPP = formatDifference(fDifPP, 2);

    const fDifPlayCount =
      sanitizeAndParse(this.userObjectEndOfSession.counts.plays) -
      sanitizeAndParse(this.userObjectStartOfSession.counts.plays);
    const difPlayCount = formatDifference(fDifPlayCount);

    for (let i = 0; i < this.playObjects.length; i++) {
      if (this.playObjects[i].background == undefined) {
        this.playObjects.splice(i, 1);
        i--;
      }
    }

    //db stuff
    this.sessionID = globalInstances.numberOfSessionsRecorded + 1;
    globalInstances.numberOfSessionsRecorded =
      globalInstances.numberOfSessionsRecorded + 1;

    let sqlSessionValues = {
      $sessionId: this.sessionID,
      $date: currentTimeForDB,
      $osuUsername: this.player.osuUsername,
      $sessionDuration: sessionDuration,
      $rank: this.userObjectEndOfSession.pp.rank,
      $difGlobalRank: difGlobalRank,
      $countryRank: this.userObjectEndOfSession.pp.countryRank,
      $difCountryRank: difCountryRank,
      $level: this.userObjectEndOfSession.level,
      $difLevel: difLevel,
      $accuracy: parseFloat(this.userObjectEndOfSession.accuracy).toFixed(2),
      $difAccuracy: difAcc,
      $pp: parseFloat(this.userObjectEndOfSession.pp.raw),
      $difPP: difPP,
      $plays: parseFloat(this.userObjectEndOfSession.counts.plays),
      $difPlays: difPlayCount,
      $ssh: this.userObjectEndOfSession.counts.SSH,
      $ss: this.userObjectEndOfSession.counts.SS,
      $sh: this.userObjectEndOfSession.counts.SH,
      $s: this.userObjectEndOfSession.counts.S,
      $a: this.userObjectEndOfSession.counts.A,
    };

    globalInstances.logMessage(
      "Calling DB session query for: " +
        this.player.osuUsername +
        " - " +
        util.inspect(sqlSessionValues) +
        "\n"
    );

    await db.insertSession(sqlSessionValues);

    for (const play of this.playObjects) {
      const sqlTitle = play.title;
      const sqlVersion = play.version;
      const sqlArtist = play.artist;

      const songDurationTotalSeconds = parseInt(play.duration);
      const [
        _,
        songDurationHours,
        songDurationMinutes,
        songDurationSeconds,
      ] = secondsToDHMS(songDurationTotalSeconds);
      const songDuration = globalInstances.convertTimeToHMS(
        songDurationHours,
        songDurationMinutes,
        songDurationSeconds
      );

      let sqlPlayValues = {
        $sessionId: this.sessionID,
        $osuUsername: play.osuUsername,
        $date: play.date,
        $bg: play.background,
        $title: sqlTitle,
        $version: sqlVersion,
        $artist: sqlArtist,
        $combo: play.combo,
        $maxCombo: play.maxCombo,
        $bpm: play.bpm,
        $playDuration: songDuration,
        $difficulty: play.stars.toFixed(2),
        $playAccuracy: play.accuracy,
        $rank: play.rank,
        $mods: play.mods.join(", "),
        $counts300: play.countsObject["300"],
        $counts100: play.countsObject["100"],
        $counts50: play.countsObject["50"],
        $countsMiss: play.countsObject["miss"],
        $playPP: play.pp.toFixed(2),
        $numSpinners: play.numSpinners,
        $numSliders: play.numSliders,
        $numCircles: play.numCircles,
        $numObjects: play.numObjects,
        $approachRate: play.ar,
        $healthPoints: play.hp,
        $overallDifficulty: play.od,
        $circleSize: play.cs,
      };
      // this.osuUsername = osuUsername;
      // this.numSpinners = map.nspinners;
      // this.numSliders = map.nsliders;
      // this.numCircles = map.ncircles;
      // this.numObjects = map.objects.length;
      // this.ar = map.ar;
      // this.hp = map.hp;
      // this.od = map.od;
      // this.cs = map.cs;

      globalInstances.logMessage(
        "Calling DB play query for: " +
          this.player.osuUsername +
          " - " +
          util.inspect(sqlPlayValues) +
          "\n"
      );

      await db.insertPlay(sqlPlayValues);
    }
    //db stuff end

    let reportImages = await ReportGenerator.generateReports(
      this.playObjects,
      this.player,
      this.userObjectEndOfSession,
      sessionDuration,
      date,
      {
        difAcc,
        difCountryRank,
        difGlobalRank,
        difLevel,
        difPP,
        difPlayCount,
        difRankedScore,
      }
    );

    globalInstances.logMessage("\nTrying to tweet...");

    const media = await Promise.all(
      reportImages.map(async (image, idx, arr) => {
        let buffer = await image.getBufferAsync(jimp.MIME_PNG);
        globalInstances.logMessage(`Posting image ${idx + 1}/${arr.length}`);
        return T.post("media/upload", {
          media_data: buffer.toString("base64"),
        }).then(async (data) => {
          if ("__fake__" in data) {
            // running w/o tweets
            let osuUsername = await UserCache.getOsuUser(
              this.player.osuUsername
            );
            await image.writeAsync(
              `./out/${osuUsername.replace(/[^A-Za-z0-9_-]/, "")}.${idx}.png`
            );
          }
          return data;
        });
      })
    );

    if (media.length > 0) {
      return this.tweetReport(
        this.player.twitterUsername,
        this.player.osuUsername,
        media.map((image) => image.data.media_id_string),
        this.sessionID
      );
    } else {
      globalInstances.logMessage("no images exist...? lol");
    }
  }

  async tweetReport(twitterUsername, osuUsername, id, sessionID) {
    const tweet = {
      status: "." + twitterUsername + " just finished an osu! session: ",
      media_ids: [id],
    };
    if (
      await twitterUtils.isTwitterUserActive(
        this.player.twitterUsername.replace("@", "")
      )
    ) {
      return T.post("statuses/update", tweet)
        .then(async (data) => {
          globalInstances.logMessage(
            `Updating session with tweet ID for ${osuUsername} (${data.data.id_str})`
          );
          await db.updateSession(data.data.id_str, sessionID);
          globalInstances.logMessage(
            " ---------------------------------------------------------------------------------A tweet was tweeted"
          );
        })
        .catch((err) => {
          globalInstances.logMessage(err);
        });
    } else {
      let strId = "<inactive twitter user>";
      globalInstances.logMessage(
        `Updating session with tweet ID for ${osuUsername} (${strId})`
      );
      await db.updateSession(strId, sessionID);
      globalInstances.logMessage(
        `Removing ${osuUsername} ${twitterUsername} from whitelist due to the username not existing`
      );

      for (const [i, player] of globalInstances.playerObjects.entries()) {
        if (player.twitterUsername === twitterUsername) {
          globalInstances.playerObjects.splice(i, 1);
        }
      }

      await db.deletePlayer(twitterUsername);
    }
  }
}

module.exports = sessionObject;
