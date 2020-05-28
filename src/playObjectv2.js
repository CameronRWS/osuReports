/**
 * @typedef {import('node-osu/lib/base/Score')} Score
 * @typedef {import('node-osu/lib/base/Beatmap')} Beatmap
 * @typedef {import('ojsama').beatmap} ojBeatmap
 */

const ojsama = require("ojsama");

const MODS = Object.keys(ojsama.modbits).filter(
  (p) => ojsama.modbits.hasOwnProperty(p) && p.length === 2
);
const modsFromBits = (bits) =>
  MODS.filter((mod) => (ojsama.modbits[mod] & bits) > 0).map((mod) =>
    mod.toUpperCase()
  );

class playObjectv2 {
  /**
   * @param {Object} options
   * @param {number} options.stars
   * @param {number} options.pp
   * @param {Score} options.score
   * @param {ojBeatmap} options.map
   * @param {string} options.osuUsername
   * @param {Beatmap} options.beatmap
   */
  constructor({ stars, pp, score, map, osuUsername, beatmap }) {
    //console.log("Play created: " + scoreOfRecentPlay.beatmapset.title);
    this.stars = stars;
    this.pp = pp;
    this.countsObject = score.counts;
    this.title = beatmap.title;
    this.artist = beatmap.artist;
    this.version = beatmap.version;
    this.mods = modsFromBits(score.raw_mods);
    this.accuracy = (score.accuracy * 100).toFixed(2);
    this.maxCombo = map.max_combo;
    this.combo = score.maxCombo;
    this.rank = score.rank;
    // this.background =
    //   "https://assets.ppy.sh/beatmaps/1351/covers/cover.jpg?1539845552";
    this.background = `https://assets.ppy.sh/beatmaps/${beatmap.beatmapSetId}/covers/cover.jpg`;
    this.date = new Date(score.date);
    this.beatmapid = beatmap.id;
    this.beatmapsetid = beatmap.beatmapSetId;
    if (this.mods.includes("DT")) {
      this.duration = (beatmap.length.drain * (2 / 3)).toFixed(0);
      this.bpm = (beatmap.bpm * 1.5).toFixed(0);
    } else {
      this.duration = beatmap.length.drain.toFixed(0);
      this.bpm = beatmap.bpm.toFixed(0);
    }
    //new stuff 5/20/2020
    this.osuUsername = osuUsername;
    this.numSpinners = map.nspinners;
    this.numSliders = map.nsliders;
    this.numCircles = map.ncircles;
    this.numObjects = map.objects.length;
    this.ar = map.ar;
    this.hp = map.hp;
    this.od = map.od;
    this.cs = map.cs;
  }

  static fromJSON(obj) {
    obj.date = new Date(obj.date);
    return obj;
  }
}

module.exports = playObjectv2;
