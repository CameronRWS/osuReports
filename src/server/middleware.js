const express = require("express");
const session = require("express-session");

const app = express();

app.use(session({ secret: "whatever", resave: true, saveUninitialized: true }));

// app.use((req, res, next) => {
//   console.dir(req.session);
//   next();
// });

module.exports = {
  path: "/",
  handler: app
};
