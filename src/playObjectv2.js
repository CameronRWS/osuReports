/**
 * @typedef {import('node-osu/lib/base/Score')} Score
 * @typedef {import('node-osu/lib/base/Beatmap')} Beatmap
 * @typedef {import('ojsama').beatmap} ojBeatmap
 */

const ojsama = require("ojsama");

class playObjectv2 {
  /**
   * @param {Object} options
   * @param {number} options.stars
   * @param {number} options.pp
   * @param {number} options.bpm
   * @param {number} options.combo
   * @param {number} options.max_combo
   * @param {Score} options.score
   * @param {ojBeatmap} options.map
   * @param {string} options.osuUsername
   * @param {Beatmap} options.beatmap
   */
  constructor({
    stars,
    pp,
    bpm,
    combo,
    max_combo,
    score,
    map,
    osuUsername,
    beatmap,
  }) {
    //console.log("Play created: " + scoreOfRecentPlay.beatmapset.title);
    this.stars = stars;
    this.pp = pp;
    this.countsObject = score.counts;
    this.title = beatmap.title;
    this.artist = beatmap.artist;
    this.version = beatmap.version;
    this.mods = "+" + ojsama.modbits.string(score.raw_mods);
    this.accuracy = (score.accuracy * 100).toFixed(2);
    this.maxCombo = max_combo;
    this.combo = combo;
    this.rank = score.rank;
    // this.background =
    //   "https://assets.ppy.sh/beatmaps/1351/covers/cover.jpg?1539845552";
    this.background = `https://assets.ppy.sh/beatmaps/${beatmap.beatmapSetId}/covers/cover.jpg`;
    this.date = new Date(score.date);
    this.beatmapid = beatmap.id;
    this.beatmapsetid = beatmap.beatmapSetId;
    if (score.mods.includes("DT")) {
      this.duration = (score.beatmap.hit_length * (2 / 3)).toFixed(0);
      this.bpm = (bpm * 1.5).toFixed(0);
    } else {
      this.duration = score.beatmap.hit_length.toFixed(0);
      this.bpm = bpm.toFixed(0);
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
