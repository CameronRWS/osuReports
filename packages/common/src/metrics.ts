import client from "prom-client";
import express from "express";

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const activeSessions = new client.Gauge({
  help: "the number of active sessions currently being tracked",
  name: "osu_reports_active_sessions",
  registers: [registry]
});

export const activePlays = new client.Gauge({
  help: "the total number of plays in the sessions being tracked",
  name: "osu_reports_active_plays",
  registers: [registry]
});

export const totalUsers = new client.Gauge({
  help: "the current number of users being tracked",
  name: "osu_reports_total_users",
  registers: [registry]
});

export const playsPerSession = new client.Histogram({
  help: "number of plays per session",
  name: "osu_reports_plays_per_session",
  buckets: client.linearBuckets(0, 10, 10),
  registers: [registry]
});

export const sessionDuration = new client.Histogram({
  help: "distribution of session duration",
  name: "osu_reports_session_duration",
  buckets: client.linearBuckets(0, 1800, 24),
  registers: [registry]
});

export const numberOfTweets = new client.Counter({
  help: "total number of tweets tweeted",
  name: "osu_reports_total_tweets",
  registers: [registry]
});

export const beatmapCacheStats = new client.Counter({
  help: "beatmap cache hits, misses, and evictions",
  name: "osu_reports_beatmap_cache_stats",
  labelNames: ["type"],
  registers: [registry]
});

export const osuApiCalls = new client.Counter({
  help: "total calls to the osu api",
  name: "osu_reports_osu_api_calls",
  registers: [registry]
});

export const app = express();
app.get("/metrics", (req, res) => {
  res.set("Content-Type", registry.contentType);
  res.end(registry.metrics());
});
