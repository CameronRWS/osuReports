const osuApi = require('./osuApi');
const ojsama = require('ojsama');
const playObjectv2 = require('./playObjectv2');
const globalInstances = require('./globalInstances');
const Twit = require('twit');
const keys = require('./consumerKeys');
const util = require('util');

const db = require('./db');
const ReportGenerator = require('./reportGenerator');

const {
  fetchAndParseBeatmap,
  fetchBeatmapJson,
  formatDifference,
  sanitizeAndParse,
  secondsToDHMS,
} = require('./utils');

var T = new Twit({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token: keys.access_token,
  access_token_secret: keys.access_token_secret,
});

// promisify some methods
T.postAsync = util.promisify(T.post);

class sessionObject {
  constructor(player, isDebug) {
    this.player = player;
    this.userObjectStartOfSession = null;
    this.userObjectEndOfSession = null;
    this.playObjects = [];
    this.sessionID = null;
    this.isDebug = null;

    //get the initial state of the user
    if (isDebug == false) {
      osuApi
        .getUser({ u: this.player.osuUsername })
        .then((user) => {
          this.userObjectStartOfSession = user;
        })
        .catch((err) => {
          globalInstances.logMessage(err);
        });
    } else {
      this.isDebug = isDebug;
      globalInstances.logMessage('\ndebug mode init');
      osuApi
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
          globalInstances.logMessage(' - ' + err);
        });
    }
  }

  addNewPlayAPI(scoreOfRecentPlay) {
    console.log('adding new play via API');
    this.playObjects.push(
      new playObjectv2('', '', '', '', '', scoreOfRecentPlay)
    );
  }

  async addNewPlayWEB(scoreOfRecentPlay) {
    console.log('adding new play via WEB');
    return fetchBeatmapJson(scoreOfRecentPlay.beatmap.beatmapset_id)
      .then(async (data) => {
        const bpm = data.bpm;
        let mods = '';
        if (scoreOfRecentPlay.mods.length > 0) {
          mods = '+';
          for (let i = 0; i < scoreOfRecentPlay.mods.length; i++) {
            mods = mods + scoreOfRecentPlay.mods[i];
          }
        }
        const acc_percent = scoreOfRecentPlay.accuracy * 100;
        let combo = scoreOfRecentPlay.max_combo;
        const nmiss = scoreOfRecentPlay.statistics.count_miss;
        if (mods.startsWith('+')) {
          mods = ojsama.modbits.from_string(mods.slice(1) || '');
        }
        return fetchAndParseBeatmap(scoreOfRecentPlay.beatmap.id).then(
          (map) => {
            try {
              const stars = Math.min(
                new ojsama.diff().calc({ map: map, mods: mods }),
                100
              );
              const pp = Math.min(
                ojsama.ppv2({
                  stars: stars,
                  combo: combo,
                  nmiss: nmiss,
                  acc_percent: acc_percent,
                }),
                10e4
              );
              const max_combo = map.max_combo();
              combo = combo || max_combo;
              this.playObjects.push(
                new playObjectv2(
                  stars.toString().split(' ')[0],
                  pp.toString().split(' ')[0],
                  bpm,
                  combo,
                  max_combo,
                  scoreOfRecentPlay
                )
              );
            } catch (error) {
              globalInstances.logMessage(
                'Err: Problem occured when going to add a play from the web - ' +
                  error +
                  '\n'
              );
            }
          }
        );
      })
      .catch((error) => {
        globalInstances.logMessage(error + ' 123');
      });
  }

  async endSession() {
    globalInstances.logMessage(
      'Attempting to end session for: ' + this.player.osuUsername + '\n'
    );
    //checks to see if there are real plays in session
    let isTweetable = false;
    for (let i = 0; i < this.playObjects.length; i++) {
      if (this.playObjects[i].background != undefined) {
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
        ' - This session has no plays with a background or only has one play';
      globalInstances.logMessage(isTweetableResponse);
      return;
    }

    const user = await osuApi.getUser({ u: this.player.osuUsername });

    this.userObjectEndOfSession = user;
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() - 6); //setting to central time
    const date = currentTime
      .toLocaleString('en-US', { timeZone: 'America/Chicago' })
      .split(',')[0];

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
      this.isDebug == false
    ) {
      const sessionDurationResponse =
        this.player.osuUsername +
        ' - This session is not long enough: ' +
        sessionTotalSeconds +
        '\n';
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
    const difLevel = formatDifference(fDifLevel * 100, 0, '%');

    const fDifRankedScore =
      sanitizeAndParse(this.userObjectEndOfSession.scores.ranked) -
      sanitizeAndParse(this.userObjectStartOfSession.scores.ranked);
    const difRankedScore = formatDifference(fDifRankedScore);

    const fDifAcc =
      sanitizeAndParse(this.userObjectEndOfSession.accuracy) -
      sanitizeAndParse(this.userObjectStartOfSession.accuracy);
    const difAcc = formatDifference(fDifAcc, 2, '%');

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
      $date: date,
      $osuUsername: this.player.osuUsername,
      $sessionDuration: sessionDuration,
      $rank: this.userObjectEndOfSession.pp.rank,
      $difGlobalRank: fDifGlobalRank,
      $countryRank: this.userObjectEndOfSession.pp.countryRank,
      $difCountryRank: fDifCountryRank,
      $level: this.userObjectEndOfSession.level,
      $difLevel: fDifLevel,
      $accuracy: parseFloat(this.userObjectEndOfSession.accuracy).toFixed(2),
      $difAccuracy: fDifAcc,
      $pp: parseFloat(this.userObjectEndOfSession.pp.raw),
      $difPP: fDifPP,
      $plays: parseFloat(this.userObjectEndOfSession.counts.plays),
      $difPlays: fDifPlayCount,
      $ssh: this.userObjectEndOfSession.counts.SSH,
      $ss: this.userObjectEndOfSession.counts.SS,
      $sh: this.userObjectEndOfSession.counts.SH,
      $s: this.userObjectEndOfSession.counts.S,
      $a: this.userObjectEndOfSession.counts.A,
    };

    globalInstances.logMessage(
      'Calling DB session query for: ' +
        this.player.osuUsername +
        ' - ' +
        util.inspect(sqlSessionValues) +
        '\n'
    );

    await db.insertSession(sqlSessionValues);

    for (let i = 0; i < this.playObjects.length; i++) {
      const sqlTitle = this.playObjects[i].title;
      const sqlVersion = this.playObjects[i].version;
      const sqlArtist = this.playObjects[i].artist;

      const songDurationTotalSeconds = parseInt(this.playObjects[i].duration);
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
        $bg: this.playObjects[i].background,
        $title: sqlTitle,
        $version: sqlVersion,
        $artist: sqlArtist,
        $combo:
          this.playObjects[i].combo + ' / ' + this.playObjects[i].maxCombo,
        $bpm: this.playObjects[i].bpm,
        $playDuration: songDuration,
        $difficulty: this.playObjects[i].stars,
        $playAccuracy: this.playObjects[i].accuracy,
        $rank: this.playObjects[i].rank,
        $mods: this.playObjects[i].mods.join(', '),
        $counts300: this.playObjects[i].countsObject.count_300,
        $counts100: this.playObjects[i].countsObject.count_100,
        $counts50: this.playObjects[i].countsObject.count_50,
        $countsMiss: this.playObjects[i].countsObject.count_miss,
        $playPP: this.playObjects[i].pp,
      };

      globalInstances.logMessage(
        'Calling DB play query for: ' +
          this.player.osuUsername +
          ' - ' +
          util.inspect(sqlPlayValues) +
          '\n'
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

    reportImages.forEach(async (image, idx) => {
      image.writeAsync(`./out/${idx}.png`);
    });

    globalInstances.logMessage('\nTrying to tweet...');

    const media = await Promise.all(
      reportImages.map(async (image, idx, arr) => {
        let buffer = await image.getBufferAsync(jimp.MIME_PNG);
        globalInstances.logMessage(`Posting image ${idx + 1}/${arr.length}`);
        return T.postAsync('media/upload', {
          media_data: buffer.toString('base64'),
        });
      })
    );

    if (media.length > 0) {
      return this.tweetReport(
        this.player.twitterUsername,
        this.player.osuUsername,
        media.map((image) => image.media_id_string),
        this.sessionID
      );
    } else {
      globalInstances.logMessage('no images exist...? lol');
    }
  }

  async tweetReport(twitterUsername, osuUsername, id, sessionID) {
    const tweet = {
      status: '.' + twitterUsername + ' just finished an osu! session: ',
      media_ids: [id],
    };
    return T.postAsync('statuses/update', tweet)
      .then(async (data) => {
        globalInstances.logMessage(
          `Updating session with tweet ID for ${osuUsername} (${data.id_str})`
        );
        await db.updateSession(data.id_str, sessionID);
        globalInstances.logMessage(
          ' ---------------------------------------------------------------------------------A tweet was tweeted'
        );
      })
      .catch((err) => {
        globalInstances.logMessage(err);
      });
  }
}

module.exports = sessionObject;
