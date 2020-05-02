var osuApi = require("./osuApi");

class playObjectv2 {
  constructor(stars, pp, bpm, combo, max_combo, scoreOfRecentPlay) {
    if (stars != "") {
      console.log("Play created: " + scoreOfRecentPlay.beatmapset.title);
      this.stars = stars;
      this.pp = pp;
      this.countsObject = scoreOfRecentPlay.statistics;
      this.title = scoreOfRecentPlay.beatmapset.title;
      this.artist = scoreOfRecentPlay.beatmapset.artist;
      this.version = scoreOfRecentPlay.beatmap.version;
      this.mods = scoreOfRecentPlay.mods;
      this.accuracy = (scoreOfRecentPlay.accuracy * 100).toFixed(2);
      this.maxCombo = max_combo;
      this.combo = combo;
      this.rank = scoreOfRecentPlay.rank;
      //this.background = "https://assets.ppy.sh/beatmaps/1351/covers/cover.jpg?1539845552"
      this.background = scoreOfRecentPlay.beatmapset.covers.cover;
      this.date = new Date(scoreOfRecentPlay.created_at);
      this.beatmapid = scoreOfRecentPlay.beatmap.id;
      this.beatmapsetid = scoreOfRecentPlay.beatmap.beatmapset_id;
      if (scoreOfRecentPlay.mods.includes("DT")) {
        this.duration = (
          scoreOfRecentPlay.beatmap.hit_length *
          (2 / 3)
        ).toFixed(0);
        this.bpm = (bpm * 1.5).toFixed(0);
      } else {
        this.duration = scoreOfRecentPlay.beatmap.hit_length.toFixed(0);
        this.bpm = bpm.toFixed(0);
      }
    } else {
      console.log("Play created: " + scoreOfRecentPlay.title);
      this.rank = scoreOfRecentPlay.rank;
      this.date = new Date(scoreOfRecentPlay.date.getTime());
    }
  }
}

module.exports = playObjectv2;
