const axios = require("axios").default;
const cheerio = require("cheerio");
const ojsama = require("ojsama");
const beatmapCache = require("./beatmapCache");

function fetchBeatmapJson(beatmap_set) {
  let bpmurl = "htts://osu.ppy.sh/beatmapsets/" + beatmap_set;
  return axios.get(bpmurl).then((response) => {
    let $ = cheerio.load(response.data);
    let html = $("#json-beatmapset").html();
    let data = JSON.parse(html);
    return data;
  });
}

async function fetchAndParseBeatmap(beatmap_id) {
  return beatmapCache
    .getBeatmapData(beatmap_id)
    .then((map) => new ojsama.parser().feed(map.toString("utf-8")).map);
}

function formatDifference(number, nDec, suffix) {
  let formatted;

  if (number === NaN) {
    return "";
  }

  if (nDec !== undefined) {
    number = number.toFixed(nDec);
    formatted = number.toString();
  } else {
    formatted = number.toLocaleString("en");
  }

  // we don't want it to be undefined
  if (!suffix) suffix = "";

  if (number > 0) {
    return `(+${formatted}${suffix})`;
  }
  if (number < 0) {
    return `(${formatted}${suffix})`;
  }
  return "";
}

function sanitizeAndParse(numberString) {
  /*
    /
      [
        ^  - match none of the characters in this bracket
        \d - match a decimal digit (could be written "0-9")
        \- - match a literal "-"
        +  - match a literal "+"
      ]
    /g - "g" flag means match as many times as it occurs
  */
  if (typeof numberString === "number") return numberString;
  if (typeof numberString !== "string")
    throw new Error("expected a number or a string");
  return parseFloat(numberString.replace(/[^\d.\-+]/g, ""));
}

function secondsToDHMS(seconds) {
  let days = Math.floor(seconds / (3600 * 24));
  seconds = seconds - days * 3600 * 24;
  let hours = Math.floor(seconds / 3600);
  seconds = seconds - hours * 3600;
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds - minutes * 60);
  return [days, hours, minutes, seconds];
}

module.exports = {
  fetchAndParseBeatmap,
  fetchBeatmapJson,
  formatDifference,
  sanitizeAndParse,
  secondsToDHMS,
};
