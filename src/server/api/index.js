const express = require("express");

const userCache = require("../../userCache");

const db = require("../../db");
const globalInstances = require("../../globalInstances");
const { requireAuth } = require("../utils");

const router = express.Router();

async function getStats() {
  return db.getStats();
}

router.get("/stats", (req, res) => {
  getStats()
    .then(stats => res.json(stats))
    .catch(err => {
      globalInstances.logMessage("error getting stats", err);
      res.status(500).json("could not fetch stats");
    });
});

/**
 * @param {string} twitterUsername
 */
async function getPlayerInfo(twitterUsername) {
  const player = await db.getPlayer(twitterUsername);

  let stats = null;
  let osu = null;
  if (player && player.osuUsername) {
    stats = await db.getPlayerStats(player.osuUsername);
    const username = await userCache.getOsuUser(player.osuUsername);
    osu = { id: player.osuUsername, username };
  }

  return {
    twitterUsername: twitterUsername,
    stats,
    osu
  };
}

router.get("/player", requireAuth, (req, res) => {
  getPlayerInfo(req.user.username)
    .then(player => {
      res.json(player);
    })
    .catch(err => {
      globalInstances.logMessage("error looking up player", err);
      res.status(500).json("unable to find player");
    });
});

async function getPlayerSessions(twitterUsername) {
  return db.getPlayerSessions(`@${twitterUsername}`);
}

router.get("/player/sessions", requireAuth, (req, res) => {
  getPlayerSessions(req.user.username).then(sessions =>
    res.json(sessions || [])
  );
});

router.get("/player/sessions/:sessionId/plays", requireAuth, (req, res) => {
  db.getSessionPlays(req.params.sessionId)
    .then(plays => res.json(plays || []))
    .catch(() => res.status(404).json("session not found"));
});

module.exports = {
  router,
  getStats,
  getPlayerInfo
};
