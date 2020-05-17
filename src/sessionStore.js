const redis = require('redis');
const _ = require('lodash');
const { promisify } = require('util');
const globalInstances = require('./globalInstances');
const sessionObject = require('./sessionObject');
const playObjectv2 = require('./playObjectv2');

const SESSION_PREFIX = 'session:';

class SessionStore {
  constructor(options) {
    options = _.merge(
      {
        host: 'localhost',
        port: 6379,
      },
      options
    );

    let client = redis.createClient(options);
    for (const cmd of ['get', 'set', 'keys', 'mget', 'del']) {
      client[`${cmd}Async`] = promisify(client[cmd]).bind(client);
    }

    this.client = client;
  }

  async storeSession(session) {
    const sessionData = JSON.stringify(session, (key, value) => {
      if (key === 'sessionObject') return;
      return value;
    });
    const sessionKey = SESSION_PREFIX + session.player.twitterUsername;
    return this.client.setAsync(sessionKey, sessionData);
  }

  async loadSessions() {
    let restored = 0;
    const sessionKeys = await this.client.keysAsync(SESSION_PREFIX + '*');
    if (sessionKeys.length > 0) {
      const sessions = await this.client
        .mgetAsync(sessionKeys)
        .then((sessions) =>
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
          await this.client.delAsync(key);
          continue;
        }

        let curSession = inst.sessionObject;
        if (!curSession) {
          curSession = inst.sessionObject = new sessionObject(inst, false);
        }

        for (const key of ['userObjectStartOfSession', 'sessionID']) {
          curSession[key] = session[key];
        }
        for (const play of session['playObjects']) {
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
    return this.client.delAsync(SESSION_PREFIX + player.twitterUsername);
  }
}

module.exports = new SessionStore({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
