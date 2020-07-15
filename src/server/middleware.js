const express = require("express");
const session = require("express-session");

const app = express();

app.use(session({ secret: "whatever", resave: true, saveUninitialized: true }));

app.post("/logout", (req, res) => {
  if (!req.session) return res.status(401).json("unauthorized");
  req.session.destroy(() => res.status(204).end());
});

// app.use((req, res, next) => {
//   console.dir(req.session);
//   next();
// });

module.exports = {
  path: "/",
  handler: app
};
