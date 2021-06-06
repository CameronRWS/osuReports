import express from "express";
import axios from "axios";

import { DB, UserCache, ReportCardCache } from "@osureport/common";
import { requireAuth } from "../utils";

const router = express.Router();

async function getStats() {
  return DB.getStats();
}

router.get("/stats", (req, res) => {
  getStats()
    .then(stats => res.json(stats))
    .catch(err => {
      console.error("error getting stats", err);
      res.status(500).json("could not fetch stats");
    });
});

router.get("/player/sessions/:sessionId/reportCard(.png)?", (req, res) => {
  getReportCard(req.params.sessionId)
    .then(image => {
      return res.contentType("image/png").send(image);
    })
    .catch(err => {
      console.error("error looking up session", err);
      res.status(500).json("unable to find session");
    });
});

async function getReportCard(sessionId) {
  let reportCard = await ReportCardCache.getReportCard(sessionId);
  return reportCard;
}

async function getPlayerInfo(user) {
  if (!user) throw new Error("no user");

  const { username, profileImage } = user;
  const player = await DB.getPlayer(username);

  let stats: any = null;
  let osu: any = null;
  if (player && player.osuUsername) {
    stats = await DB.getPlayerStats(player.osuUsername);
    const username = await UserCache.getOsuUser(player.osuUsername);
    osu = {
      id: player.osuUsername,
      username
    };
  }

  return {
    twitterUsername: username,
    profileImage,
    stats,
    osu
  };
}

router.get("/player", requireAuth, (req, res) => {
  getPlayerInfo(req.user)
    .then(player => {
      res.json(player);
    })
    .catch(err => {
      console.error("error looking up player", err);
      res.status(500).json("unable to find player");
    });
});

async function getPlayerSessions(twitterUsername) {
  return DB.getPlayerSessions(`@${twitterUsername}`);
}

router.get("/player/sessions", requireAuth, (req, res) => {
  getPlayerSessions(req.user?.username).then(sessions =>
    res.json(sessions || [])
  );
});

router.get("/player/sessions/:sessionId/plays", (req, res) => {
  DB.getSessionPlays(req.params.sessionId)
    .then(plays => res.json(plays || []))
    .catch(() => res.status(404).json("session not found"));
});

router.get("/player/sessions/:sessionId", (req, res) => {
  DB.getSession(req.params.sessionId)
    .then(async session => {
      const username = await UserCache.getOsuUser(session.osuUsername);
      return res.json({
        ...session,
        osu: {
          id: session.osuUsername,
          username
        }
      });
    })
    .catch(() => res.status(404).json("session not found"));
});

router.get("/cover/:beatmapId", requireAuth, (req, res) => {
  const { beatmapId } = req.params;
  if (!beatmapId) return res.status(400).end();
  const coverUrl = `https://assets.ppy.sh/beatmaps/${beatmapId}/covers/cover.jpg`;
  // if (req.xhr || req.headers["sec-fetch-site"] === "cross-site") {
  axios
    .get(coverUrl, {
      responseType: "arraybuffer"
    })
    .then(data => {
      return res
        .status(200)
        .contentType("image/jpeg")
        .end(data.data);
    })
    .catch(err => {
      return axios
        .get("https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg", {
          responseType: "arraybuffer"
        })
        .then(({ data }) =>
          res
            .status(200)
            .contentType("image/jpeg")
            .end(data)
        );
      return res.status(404).end();
    });
  // }
  // return res.status(302).redirect(coverUrl);
});

export { router, getStats, getPlayerInfo };
