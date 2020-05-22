const sqlite3 = require("sqlite3");
const promisify = require("util").promisify;

function prepare(self, prop, stmt) {
  if (prop in self && self[prop] !== null) return Promise.resolve();

  return new Promise((resolve, reject) => {
    self.prepare(stmt, function (err) {
      if (err) reject(err);

      // guard against double initialization
      if (self[prop] !== null) {
        if (self[prop] !== this) this.finalize();
        resolve();
      }

      self[prop] = this;
      resolve();
    });
  });
}

function runCallback(resolve, reject) {
  return function (err) {
    if (err) reject(err);
    resolve({
      lastID: this.lastID,
      changes: this.changes,
    });
  };
}

class DB extends sqlite3.Database {
  constructor(file) {
    super(file);
    this._insert_session_stmt = null;
    this._insert_play_stmt = null;
    this._update_session_stmt = null;
    this._delete_player_stmt = null;
    this._insert_player_stmt = null;
  }

  async initialize() {
    return Promise.all([
      prepare(
        this,
        "_insert_session_stmt",
        "INSERT INTO sessionsTable VALUES ($sessionId, NULL, $date, $osuUsername," +
          " $sessionDuration, $rank, $difGlobalRank, $countryRank, $difCountryRank," +
          " $level, $difLevel, $accuracy, $difAccuracy, $pp, $difPP, $plays," +
          " $difPlays, $ssh, $ss, $sh, $s, $a)"
      ),
      prepare(
        this,
        "_insert_play_stmt",
        "INSERT INTO playsTable VALUES ($sessionId, $osuUsername, $date, $bg, $title, $version, $artist, " +
          "$combo, $maxCombo, $bpm, $playDuration, $difficulty, $playAccuracy, $rank, $mods, " +
          "$counts300, $counts100, $counts50, $countsMiss, $playPP, $numSpinners, $numSliders, " +
          "$numCircles, $numObjects, $approachRate, $healthPoints, $overallDifficulty, $circleSize)"
      ),

      prepare(
        this,
        "_update_session_stmt",
        "UPDATE sessionsTable SET tweetID = $tweetId WHERE sessionID = $sessionId"
      ),

      prepare(
        this,
        "_delete_player_stmt",
        "DELETE FROM playersTable WHERE twitterUsername = $twitterUsername"
      ),
      prepare(
        this,
        "_insert_player_stmt",
        "INSERT INTO playersTable VALUES ($osuUsername, $twitterUsername)"
      ),
    ]);
  }

  async deletePlayer(twitterUsername) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._delete_player_stmt.run(
          { $twitterUsername: twitterUsername },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async insertPlayer(osuUsername, twitterUsername) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._insert_player_stmt.run(
          { $osuUsername: osuUsername, $twitterUsername: twitterUsername },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async updateSession(tweetId, sessionId) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._update_session_stmt.run(
          { $tweetId: tweetId, $sessionId: sessionId },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async insertSession(sessionObj) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._insert_session_stmt.run(sessionObj, runCallback(resolve, reject));
      });
    });
  }

  async insertPlay(playObj) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._insert_play_stmt.run(playObj, runCallback(resolve, reject));
      });
    });
  }
}

const dbPath = process.env.DATABASE || "osuReports.db";
const db = new DB(dbPath);
db.initialize();

module.exports = db;
