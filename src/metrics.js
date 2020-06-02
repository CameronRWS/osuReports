const client = require("prom-client");
const express = require("express");

const metricsPort = +(process.env.METRICS_PORT || "9010");

client.collectDefaultMetrics();

const activeSessions = new client.Gauge({
  help: "the number of active sessions currently being tracked",
  name: "osu_reports_active_sessions",
});

const activePlays = new client.Gauge({
  help: "the total number of plays in the sessions being tracked",
  name: "osu_reports_active_plays",
});

const totalUsers = new client.Gauge({
  help: "the current number of users being tracked",
  name: "osu_reports_total_users",
});

const playsPerSession = new client.Histogram({
  help: "number of plays per session",
  name: "osu_reports_plays_per_session",
  buckets: client.linearBuckets(0, 10, 10),
});

const sessionDuration = new client.Histogram({
  help: "distribution of session duration",
  name: "osu_reports_session_duration",
  buckets: client.linearBuckets(0, 1800, 24),
});

const numberOfTweets = new client.Counter({
  help: "total number of tweets tweeted",
  name: "osu_reports_total_tweets",
});

const beatmapCacheStats = new client.Counter({
  help: "beatmap cache hits, misses, and evictions",
  name: "osu_reports_beatmap_cache_stats",
  labelNames: ["type"],
});

const osuApiCalls = new client.Counter({
  help: "total calls to the osu api",
  name: "osu_reports_osu_api_calls",
});

const server = express();
server.get("/metrics", (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(client.register.metrics());
});
server.listen(metricsPort);

console.log(`serving metrics on port ${metricsPort}`);

module.exports = {
  server,
  activeSessions,
  activePlays,
  totalUsers,
  playsPerSession,
  sessionDuration,
  numberOfTweets,
  beatmapCacheStats,
  osuApiCalls,
};
