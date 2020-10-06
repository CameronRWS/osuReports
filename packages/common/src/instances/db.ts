import sqlite3, { Statement, RunResult } from "sqlite3";
import { promisify } from "util";

type StmtCallback = (this: Statement, err: any) => void;
type RunResultCallback = (this: RunResult, err: any) => void;

function prepare(self: DB, prop: string, stmt: string): Promise<void> {
  if (prop in self && self[prop] !== null) return Promise.resolve();

  return new Promise((resolve, reject) => {
    self.prepare(stmt, function(err) {
      if (err) reject(err);

      // guard against double initialization
      if (self[prop] !== null) {
        if (self[prop] !== this) this.finalize();
        resolve();
      }

      self[prop] = this;
      resolve();
    } as StmtCallback);
  });
}

function runCallback(resolve, reject) {
  return function(err) {
    if (err) reject(err);
    resolve({
      lastID: this.lastID,
      changes: this.changes
    });
  } as RunResultCallback;
}

class DB extends sqlite3.Database {
  private _insert_session_stmt: Statement | null = null;
  private _insert_play_stmt: Statement | null = null;
  private _update_session_stmt: Statement | null = null;
  private _delete_player_stmt: Statement | null = null;
  private _insert_player_stmt: Statement | null = null;
  private _set_player_status_stmt: Statement | null = null;
  private _initialized: Promise<unknown> | null = null;

  protected getAsync: ((sql: string) => Promise<any>) &
    ((sql: string, params: any) => Promise<any>) &
    ((sql: string, ...params: any[]) => Promise<any>);

  protected allAsync: ((sql: string) => Promise<any[]>) &
    ((sql: string, params: any) => Promise<any[]>) &
    ((sql: string, ...params: any[]) => Promise<any[]>);

  constructor(file) {
    super(file);
    this.getAsync = promisify(this.get).bind(this);
    this.allAsync = promisify(this.all).bind(this) as any;
    this._initialized = this.initialize();
  }

  async initialize() {
    return Promise.all([
      prepare(
        this,
        "_insert_session_stmt",
        "INSERT INTO sessionsTable VALUES ($sessionId, NULL, $date, $osuUsername," +
          " $sessionDuration, $rank, $difGlobalRank, $countryRank, $difCountryRank," +
          " $level, $difLevel, $accuracy, $difAccuracy, $pp, $difPP, $plays," +
          " $difPlays, $ssh, $ss, $sh, $s, $a, $difSSH, $difSS, $difSH, $difS, $difA," +
          " $rankedScore, $difRankedScore, $secondsPlayed)"
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
        "INSERT INTO playersTable VALUES ($osuUsername, $twitterUsername, 0)"
      ),
      prepare(
        this,
        "_set_player_status_stmt",
        "UPDATE playersTable SET isSubscribed = $status WHERE twitterUsername LIKE $twitterUsername"
      )
    ]);
  }

  async deletePlayer(twitterUsername) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._delete_player_stmt!.run(
          {
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
        this._insert_player_stmt!.run(
          {
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
        this._update_session_stmt!.run(
          {
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
        this._insert_session_stmt!.run(
          sessionObj,
          runCallback(resolve, reject)
        );
      });
    });
  }

  async insertPlay(playObj) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._insert_play_stmt!.run(playObj, runCallback(resolve, reject));
      });
    });
  }

  async setPlayerSubscriptionStatus(twitterUsername, status) {
    return new Promise(async (resolve, reject) => {
      await this._initialized;

      this.serialize(() => {
        this._set_player_status_stmt!.run(
          {
            $twitterUsername: twitterUsername,
            $status: status
          },
          runCallback(resolve, reject)
        );
      });
    });
  }

  async getStats(): Promise<{
    players: number;
    plays: number;
    sessions: number;
  }> {
    await this._initialized;

    return this.getAsync(`
      SELECT
        (SELECT COUNT(*) FROM playersTable) AS players,
        (SELECT COUNT(*) FROM playsTable) AS plays,
        (SELECT COUNT(*) FROM sessionsTable) AS sessions
    `);
  }

  async getPlayer(
    twitterUsername
  ): Promise<{ twitterUsername: string; osuUsername: string } | null> {
    await this._initialized;

    if (twitterUsername.charAt(0) !== "@") {
      twitterUsername = "@" + twitterUsername;
    }

    return (
      this.getAsync(
        `
      SELECT * 
      FROM playersTable 
      WHERE twitterUsername LIKE $twitterUsername
    `,
        {
          $twitterUsername: twitterUsername
        }
      ) || null
    );
  }

  async getPlayerSubscriptionStatus(twitterUsername): Promise<number | null> {
    await this._initialized;

    if (twitterUsername.charAt(0) !== "@") {
      twitterUsername = "@" + twitterUsername;
    }

    return (
      this.getAsync(
        `
      SELECT isSubscribed 
      FROM playersTable 
      WHERE twitterUsername LIKE $twitterUsername
    `,
        {
          $twitterUsername: twitterUsername
        }
      ) || null
    );
  }

  async getPlayerStats(osuId): Promise<{ sessions: number; plays: number }> {
    await this._initialized;

    return this.getAsync(
      `
      SELECT
        (SELECT COUNT(*) FROM sessionsTable WHERE osuUsername = $osuId) AS sessions,
        (SELECT COUNT(*) FROM playsTable WHERE osuUsername = $osuId) AS plays
    `,
      {
        $osuId: osuId
      }
    );
  }

  async getPlayerSessions(twitterUsername) {
    await this._initialized;

    return this.allAsync(
      `
      SELECT *
      FROM sessionsTable
      WHERE osuUsername = (SELECT osuUsername FROM playersTable WHERE twitterUsername LIKE $twitterUsername)
    `,
      {
        $twitterUsername: twitterUsername
      }
    );
  }

  async getSessionPlays(sessionId): Promise<osuReports.Play[]> {
    await this._initialized;

    return this.allAsync(
      `
      SELECT *
      FROM playsTable
      WHERE sessionId = $sessionId
      `,
      {
        $sessionId: sessionId
      }
    );
  }
  async getSession(sessionId): Promise<osuReports.Session> {
    await this._initialized;
    return this.getAsync(
      `
      SELECT *
      FROM sessionsTable
      WHERE sessionId = $sessionId
      `,
      {
        $sessionId: sessionId
      }
    );
  }

  async getPlayers(): Promise<osuReports.Player[]> {
    await this._initialized;

    return this.allAsync(
      `
      SELECT *
      FROM playersTable
      `
    );
  }
}

const dbPath = process.env.DATABASE || "osuReports.db";

export = new DB(dbPath);
