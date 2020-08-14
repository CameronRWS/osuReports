const sqlite3 = require("sqlite3");
const promisify = require("util").promisify;

/**
 * @typedef {import('sqlite3').Statement} Statement
 * @typedef {import('sqlite3').RunResult} RunResult
 *
 * @typedef {(this: Statement, err: any) => void} StmtCallback
 * @typedef {(this: RunResult, err: any) => void} RunResultCallback
 */

function prepare(self, prop, stmt) {
  if (prop in self && self[prop] !== null) return Promise.resolve();

  return new Promise((resolve, reject) => {
    self.prepare(
      stmt,
      /** @type {StmtCallback} */
      (function (err) {
        if (err) reject(err);

        // guard against double initialization
        if (self[prop] !== null) {
          if (self[prop] !== this) this.finalize();
          resolve();
        }

        self[prop] = this;
        resolve();
      })
    );
  });
}

function runCallback(resolve, reject) {
  return /** @type {RunResultCallback} */ (function (err) {
    if (err) reject(err);
    resolve({
      lastID: this.lastID,
      changes: this.changes
    });
  });
}

class DB extends sqlite3.Database {
  constructor(file) {
    super(file);
    this._insert_session_stmt = null;
    this._insert_play_stmt = null;
    this._update_session_stmt = null;
    this._delete_player_stmt = null;
    this._insert_player_stmt = null;
    this._initialized = this.initialize();

    /**
     * @type {((sql: string) => Promise<any>) &
    ((sql: string, params: any) => Promise<any>) &
    ((sql: string, ...params: any[]) => Promise<any>)}
     */
    this.getAsync = promisify(this.get).bind(this);

    /**
     * @type {((sql: string) => Promise<any[]>) &
    ((sql: string, params: any)=> Promise<any[]>) &
    ((sql: string, ...params: any[])=> Promise<any[]>)}
     */
    this.allAsync = promisify(this.all).bind(this);
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
      )
    ]);
  }

  async deletePlayer(twitterUsername) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._delete_player_stmt.run({
            $twitterUsername: twitterUsername
          },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async insertPlayer(osuUsername, twitterUsername) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._insert_player_stmt.run({
            $osuUsername: osuUsername,
            $twitterUsername: twitterUsername
          },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async updateSession(tweetId, sessionId) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._update_session_stmt.run({
            $tweetId: tweetId,
            $sessionId: sessionId
          },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async insertSession(sessionObj) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._insert_session_stmt.run(sessionObj, runCallback(resolve, reject));
      });
    });
  }

  async insertPlay(playObj) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._insert_play_stmt.run(playObj, runCallback(resolve, reject));
      });
    });
  }

  async getStats() {
    await this._initialized;

    return /** @type {Promise<{ players: number, plays: number, sessions: number }>} */ (this
      .getAsync(`
      SELECT
        (SELECT COUNT(*) FROM playersTable) AS players,
        (SELECT COUNT(*) FROM playsTable) AS plays,
        (SELECT COUNT(*) FROM sessionsTable) AS sessions
    `));
  }

  async getPlayer(twitterUsername) {
    await this._initialized;

    if (twitterUsername.charAt(0) !== "@") {
      twitterUsername = "@" + twitterUsername;
    }

    return (
      /** @type {Promise<{twitterUsername: string, osuUsername: string} | null>} */
      (this.getAsync(
        `
      SELECT * 
      FROM playersTable 
      WHERE twitterUsername LIKE $twitterUsername
    `, {
          $twitterUsername: twitterUsername
        }
      ) || null)
    );
  }

  async getPlayerStats(osuId) {
    await this._initialized;

    return /** @type {Promise<{ sessions: number, plays: number }>} */ (this.getAsync(
      `
      SELECT
        (SELECT COUNT(*) FROM sessionsTable WHERE osuUsername = $osuId) AS sessions,
        (SELECT COUNT(*) FROM playsTable WHERE osuUsername = $osuId) AS plays
    `, {
        $osuId: osuId
      }
    ));
  }

  async getPlayerSessions(twitterUsername) {
    await this._initialized;

    return this.allAsync(
      `
      SELECT *
      FROM sessionsTable
      WHERE osuUsername = (SELECT osuUsername FROM playersTable WHERE twitterUsername LIKE $twitterUsername)
    `, {
        $twitterUsername: twitterUsername
      }
    );
  }

  async getSessionPlays(sessionId) {
    await this._initialized;

    return /** @type {Promise<osuReports.Play[]>} */ (this.allAsync(
      `
      SELECT *
      FROM playsTable
      WHERE sessionId = $sessionId
      `, {
        $sessionId: sessionId
      }
    ));
  }

  async getPlayers() {
    await this._initialized;

    return (this.allAsync(
      `
      SELECT *
      FROM playersTable
      `
    ));
  }
}

const dbPath = process.env.DATABASE || "osuReports.db";

module.exports = new DB(dbPath);