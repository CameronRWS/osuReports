const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const db = require("../db");
const userCache = require("../userCache");
const { requireAuth, flash } = require("./utils");
const { getPlayerInfo } = require("./api");

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "whatever", resave: true, saveUninitialized: true }));
app.use(flash);

app.post("/logout", (req, res) => {
  if (!req.session) return res.status(401).json("unauthorized");
  req.session.destroy(() => {
    if (!req.xhr) {
      return res.status(302).redirect("/");
    }
    return res.status(204).end();
  });
});

app.post("/action_disable", requireAuth, async (req, res) => {
  const { user } = req;

  await db.deletePlayer(`@${user.username}`);

  if (!req.xhr) {
    return res.status(302).redirect("/player");
  }
  return res.status(204).end();
});

app.post("/action_enable", requireAuth, async (req, res) => {
  const { user } = req;

  const osuUsername = req.body.username;
  const osuId = await userCache.convertOsuUser(osuUsername, "id");
  if (!osuId) {
    if (!req.xhr) {
      return res
        .flash(`Unknown osu! username ${osuUsername}`)
        .status(302)
        .redirect("/player");
    }
    return res
      .status(400)
      .json({ flash: [`Unknown osu! username ${osuUsername}`] });
  }

  await db.insertPlayer(osuId, `@${user.username}`);

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
