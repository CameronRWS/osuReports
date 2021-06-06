import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import Redis from "ioredis";
import redisStoreFactory from "connect-redis";
import passport from "passport";

import { DB, UserCache } from "@osureport/common";
import { requireAuth, flash } from "./utils";
import { router as apiRouter, getPlayerInfo } from "./api";
import { router as twitterRouter } from "./api/twitter";

const RedisStore = redisStoreFactory(session);

const app = express();

const redisClient = new Redis({
  port: +(process.env.REDIS_PORT || "6379"),
  host: process.env.REDIS_HOST || "localhost"
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "tHi$_i$_s3cR3t",
    resave: true,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
      sameSite: "lax",
      httpOnly: true
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash);

app.use("/twitter", twitterRouter);
app.use("/api", apiRouter);

app.post("/logout", (req, res) => {
  if (req.isUnauthenticated()) return res.status(400).json("not logged in");

  req.logout();

  if (!req.xhr) {
    return res.redirect("/");
  }
  return res.status(204).end();
});

app.post("/action_disable", requireAuth, async (req, res) => {
  if (!req.isAuthenticated()) return; // can't happen

  const { user } = req;

  await DB.deletePlayer(`@${user.username}`);

  if (!req.xhr) {
    return res.status(302).redirect("/player");
  }
  return res.status(204).end();
});

app.post("/action_enable", requireAuth, async (req, res) => {
  if (!req.isAuthenticated()) return; // can't happen

  const { user } = req;

  const osuUsername = req.body.username || "";

  if (!osuUsername.trim().length) {
    const err = `osu! username cannot be empty!`;
    if (req.xhr) {
      return res.status(400).json({ flash: [err] });
    }
    return res
      .flash(err)
      .status(302)
      .redirect("/player");
  }

  const osuId = await UserCache.convertOsuUser(osuUsername, "id");
  if (!osuId) {
    const err = `osu! username not found: ${osuUsername}`;
    if (!req.xhr) {
      return res
        .flash(err)
        .status(302)
        .redirect("/player");
    }
    return res.status(400).json({ flash: [err] });
  }

  await DB.insertPlayer(osuId, `@${user.username}`);

  if (req.xhr) {
    return res.status(201).json(await getPlayerInfo(req.user.username));
  }
  return res.status(302).redirect("/player");
});

// app.use((req, res, next) => {
//   console.dir(req.session);
//   next();
// });

module.exports = {
  path: "/",
  handler: app
};
