const Redis = require("ioredis");
const _ = require("lodash");
const globalInstances = require("./globalInstances");
const sessionObject = require("./sessionObject");
const playObjectv2 = require("./playObjectv2");

const SESSION_PREFIX = "session:";

class SessionStore {
  constructor(options) {
    options = _.merge(
      {
        host: "localhost",
        port: 6379,
      },
      options
    );

    let client = new Redis(options);

    this.client = client;
  }

  async storeSession(session) {
    const sessionData = JSON.stringify(session, (key, value) => {
      if (key === "sessionObject") return;
      return value;
    });
    const sessionKey = SESSION_PREFIX + session.player.twitterUsername;
    return this.client.set(sessionKey, sessionData);
  }

  async loadSessions() {
    let restored = 0;
    const sessionKeys = await this.client.keys(SESSION_PREFIX + "*");
    if (sessionKeys.length > 0) {
      const sessions = await this.client.mget(sessionKeys).then((sessions) =>
        _.zip(
          sessionKeys,
          sessions.map((session) => JSON.parse(session))
        )
      );
      for (const [key, session] of sessions) {
        const { player } = session;
        let inst = globalInstances.playerObjects.find(
          (p) => p.twitterUsername === player.twitterUsername
        );
        if (inst === undefined) {
          globalInstances.logMessage(
            `Warning, have session for ${session.twitterUsername}, who is no longer tracked.`
          );
          await this.client.del(key);
          continue;
        }

        let curSession = inst.sessionObject;
        if (!curSession) {
          curSession = inst.sessionObject = new sessionObject(inst);
        }

        for (const key of ["userObjectStartOfSession", "sessionID"]) {
          curSession[key] = session[key];
        }
        for (const play of session["playObjects"]) {
          curSession.playObjects.push(playObjectv2.fromJSON(play));
        }

        globalInstances.logMessage(
          `Restored session for ${player.osuUsername}/${player.twitterUsername}`
        );
        restored++;
      }
    }

    globalInstances.logMessage(`Restored ${restored} sessions total`);
  }

  async deleteSession(player) {
    return this.client.del(SESSION_PREFIX + player.twitterUsername);
  }
}

module.exports = new SessionStore({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
