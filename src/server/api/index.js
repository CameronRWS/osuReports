const express = require("express");

const userCache = require("../../userCache");

const db = require("../../db");
const globalInstances = require("../../globalInstances");

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

/** @type {import("express").RequestHandler} */
async function requireAuth(req, res, next) {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).json("unauthenticated");
  }
  next();
}

/**
 * @param {import("express").Request} req
 */
async function getPlayerInfo(req) {
  const twitterUsername = req.session.passport.user.username;

  const player = await db.getPlayer(twitterUsername);

  let stats = null;
  let username = null;
  if (player && player.osuUsername) {
    stats = await db.getPlayerStats(player.osuUsername);
    username = await userCache.getOsuUser(player.osuUsername);
  }

  const osu = { id: player.osuUsername, username };

  return {
    twitterUsername: twitterUsername,
    stats,
    osu
  };
}

router.get("/player", requireAuth, (req, res) => {
  getPlayerInfo(req)
    .then(player => {
      res.json(player);
    })
    .catch(err => {
      globalInstances.logMessage("error looking up player", err);
      res.status(500).json("unable to find player");
    });
});

module.exports = {
  router,
  getStats,
  getPlayerInfo
};
