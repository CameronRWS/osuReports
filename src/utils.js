const axios = require("axios").default;
const cheerio = require("cheerio");
const ojsama = require("ojsama");

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
  let map_url = `https://osu.ppy.sh/osu/${beatmap_id}`;
  return axios
    .get(map_url)
    .then((response) => {
      let parser = new ojsama.parser();
      parser.feed(response.data);
      return parser.map;
    })
    .catch((err) => {
      console.log("Could not get map", err.stack);
      return null;
    });
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
  return parseFloat(("" + numberString).replace(/[^\d.\-+]/g, ""));
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
