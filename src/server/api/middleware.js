const express = require("express");
const { router: api } = require("./index");

const app = express();
app.use(api);

module.exports = {
  path: "/api",
  handler: app
};
