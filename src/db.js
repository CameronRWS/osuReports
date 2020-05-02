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
    this._add_session_stmt = null;
    this._add_play_stmt = null;
  }

  async initialize() {
    return Promise.all([
      prepare(
        this,
        "_add_session_stmt",
        "INSERT INTO sessionsTable VALUES ($sessionId, NULL, $date, $osuUsername," +
          " $sessionDuration, $rank, $difGlobalRank, $countryRank, $difCountryRank," +
          " $level, $difLevel, $accuracy, $difAccuracy, $pp, $difPP, $plays," +
          " $difPlays, $ssh, $ss, $sh, $s, $a)"
      ),
      prepare(
        this,
        "_add_play_stmt",
        "INSERT INTO playsTable VALUES ($sessionId, $bg, $title, $version, $artist, " +
          "$combo, $bpm, $playDuration, $difficulty, $playAccuracy, $rank, $mods, " +
          "$counts300, $counts100, $counts50, $countsMiss, $playPP)"
      ),
    ]);
  }

  async insertSession(sessionObj) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._add_session_stmt.run(sessionObj, runCallback(resolve, reject));
      });
    });
  }

  async insertPlay(playObj) {
    return new Promise(async (resolve, reject) => {
      await db.initialize();

      this.serialize(() => {
        this._add_play_stmt.run(playObj, runCallback(resolve, reject));
      });
    });
  }
}

const db = new DB("osuReports_v2.db");
db.initialize();

module.exports = db;
