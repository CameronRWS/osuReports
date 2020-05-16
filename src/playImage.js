/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 * @typedef {import('./playObjectv2')} PlayObject
 */
const jimp = require("jimp");
const resourceGetter = require("./resourceGetter");
const { DrawTools } = require("./drawTools");
const globalInstances = require("./globalInstances");
const { secondsToDHMS } = require("./utils");

function truncateText(measure, text, maxWidth) {
  if (measure(text) <= maxWidth) return text;
  text += "...";
  while (text.length > 3 && measure(text) > maxWidth) {
    text = text.slice(0, -4) + "...";
  }
  return text;
}

/**
 *
 * @param {(text: string) => number} measure
 * @param {string} text
 * @param {number} maxWidth
 */
function wrapText(measure, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = words.reduce((lines, word) => {
    const curLine = lines[lines.length - 1] || "";
    const nextWidth = measure(curLine + " " + word);
    if (nextWidth > maxWidth && measure(word) <= maxWidth) {
      lines.splice(lines.length - 1, 1, curLine);
    } else if (nextWidth > maxWidth) {
      // figure out where to split this word
    }
    return lines;
  }, []);
}

class PlayImage extends DrawTools {
  /**
   * @private
   * @param {Jimp} image
   * @param {PlayObject} playObject
   */
  constructor(image, playObject) {
    super(image);
    this.play = playObject;
  }

  /**
   * Creates a new play image from a play object
   * @param {PlayObject} playObject
   */
  static async create(playObject) {
    return jimp
      .create(900, 250, 0)
      .then((image) => new PlayImage(image, playObject))
      .then((playImage) => playImage.draw());
  }

  /** @private */
  async draw() {
    const { background, isDefault } = await resourceGetter.getBackground(
      this.play.background
    );
    if (isDefault) {
      this.play.artist += " <default bg>";
    }

    background.mask(await resourceGetter.getImage("playImageMask"), 0, 0);
    this.image.blit(background.brightness(-0.5), 0, 0);

    await this._drawTitle();
    await this._drawRank();
    await this._drawAccuracy();
    await this._drawDifficulty();
    await this._drawSongDuration();
    await this._drawBPM();
    await this._drawPP();
    await this._drawMods();
    await this._drawCombo();
    await this._drawCounts();

    return this.image;
  }

  /** @private */
  async _drawTitle() {
    globalInstances.logMessage("| working on titles ");
    //this.play.version = "";
    let version = this.play.version;
    if (version.length > 20) {
      version = version.substring(0, 20) + "...";
    }

    const lightBlue = await resourceGetter.getFont("ubuntuBLightBlue32");
    const white = await resourceGetter.getFont("ubuntuBWhite24");
    const measure = (text) => jimp.measureText(lightBlue, text);
    const formatVersion = (version) => ` [${version}]`;

    const title = truncateText(
      measure,
      this.play.title,
      1000 - measure(formatVersion(version))
    );

    this.image.print(
      lightBlue,
      5,
      0,
      title + formatVersion(version),
      680,
      (err, image, { y }) => {
        const measure = (text) => jimp.measureText(white, text);
        const artist = truncateText(measure, this.play.artist, 600);
        image.print(white, 5, y, "  by " + artist, 1000);
      }
    );
  }

  /** @private */
  async _drawRank() {
    globalInstances.logMessage("| working on rank ");
    var playRankX = 774;
    var playRankY = 50;

    var playRankToResourceNameAndXOffset = {
      XH: ["rankSSPlus", 0],
      X: ["rankSS", 0],
      SH: ["rankSPlus", 0],
      S: ["rankS", 0],
      A: ["rankA", 10],
      B: ["rankB", 20],
      C: ["rankC", 20],
      D: ["rankD", 20],
    };

    var [resource, xOffset] = playRankToResourceNameAndXOffset[this.play.rank];

    this.image.composite(
      await resourceGetter.getImage(resource),
      playRankX + xOffset,
      playRankY
    );
  }

  /** @private */
  async _drawAccuracy() {
    globalInstances.logMessage("| working on acc ");
    var gold = await resourceGetter.getFont("ubuntuBGold52");

    var yOffset = -9;
    var xOffset = 705;
    if (this.play.accuracy == "100.00") {
      xOffset -= 27;
    }
    this.image.print(gold, xOffset, yOffset, this.play.accuracy + "%");
  }

  /** @private */
  async _drawDifficulty() {
    globalInstances.logMessage("| working on difficulty ");
    var playStarY = 210;
    var playStarX = 170;
    var countOfStars = Math.ceil(parseFloat(this.play.stars)) - 1;
    var partialStar = (parseFloat(this.play.stars) % 1).toFixed(2);
    if (partialStar == "0.0") {
      countOfStars += 1;
    }
    var posOfPartialStar;
    for (var i = 1; i <= countOfStars; i++) {
      posOfPartialStar = playStarX + (i - 1) * 40;
      this.image.composite(
        await resourceGetter.getImage("onlineStar", 0),
        playStarX + (i - 1) * 40,
        playStarY
      );
    }

    var shouldPrintPartialStar = true;
    var partialStarX;
    var partialStarY;
    var starSize;
    if (partialStar == "0.0") {
      posOfPartialStar = posOfPartialStar - 40; //offset where the (x.xx) prints
      shouldPrintPartialStar = false;
    } else if (partialStar < "0.3") {
      starSize = 3;
      partialStarX = -119;
      partialStarY = 10;
    } else if (partialStar < "0.6") {
      starSize = 2;
      partialStarX = -121;
      partialStarY = 7;
    } else if (partialStar < "1") {
      starSize = 1;
      partialStarX = -127;
      partialStarY = 4;
    }
    if (shouldPrintPartialStar) {
      this.image.composite(
        await resourceGetter.getImage("onlineStar", starSize),
        playStarX + posOfPartialStar + partialStarX,
        playStarY + partialStarY
      );
    }
    this.image.print(
      await resourceGetter.getFont("ubuntuBLightBlue32"),
      5,
      playStarY,
      "Difficulty: "
    );
    this.image.print(
      await resourceGetter.getFont("ubuntuBWhite32"),
      180 + posOfPartialStar - 100,
      playStarY,
      "(" + this.play.stars + ")"
    );
  }

  async _drawSongDuration() {
    globalInstances.logMessage("| working on song duration ");
    var durationX = 16;
    var durationY = 175;
    var songDurationTotalSeconds = parseInt(this.play.duration);
    const [
      _,
      songDurationHours,
      songDurationMinutes,
      songDurationSeconds,
    ] = secondsToDHMS(songDurationTotalSeconds);
    var songDuration = globalInstances.convertTimeToHMS(
      songDurationHours,
      songDurationMinutes,
      songDurationSeconds
    );
    this.image.print(
      await resourceGetter.getFont("ubuntuBLightBlue32"),
      durationX,
      durationY,
      "Duration: "
    );
    this.image.print(
      await resourceGetter.getFont("ubuntuBWhite32"),
      durationX + 150,
      durationY,
      songDuration
    );
  }

  async _drawBPM() {
    var bpmX = 80;
    var bpmY = 140;
    this.image.print(
      await resourceGetter.getFont("ubuntuBLightBlue32"),
      bpmX,
      bpmY,
      "BPM: "
    );
    this.image.print(
      await resourceGetter.getFont("ubuntuBWhite32"),
      bpmX + 85,
      bpmY,
      this.play.bpm
    );
  }

  async _drawPP() {
    globalInstances.logMessage("| working on pp ");
    var yPPOffset = 185;
    var xPPOffset = -18;
    var lengthOfPlayImage = 900;
    var pp = Math.ceil(this.play.pp) + "pp";
    var lengthOfText = await jimp.measureText(
      await resourceGetter.getFont("ubuntuBGold52"),
      pp
    );
    this.image.print(
      await resourceGetter.getFont("ubuntuBGold52"),
      lengthOfPlayImage - lengthOfText + xPPOffset,
      yPPOffset,
      pp
    );
  }

  async _drawMods() {
    globalInstances.logMessage("| working on mods ");
    var modY = 120;
    var modX = 842;
    var playModToResource = {
      DT: "modDoubleTime",
      NC: "modNightcore",
      PF: "modPerfect",
      HD: "modHidden",
      SD: "modSuddenDeath",
      FL: "modFlashlight",
      HR: "modHardRock",
      NF: "modNoFail",
      EZ: "modEasy",
    };
    for (var mod in playModToResource) {
      if (this.play.mods.includes(mod)) {
        this.image.composite(
          await resourceGetter.getImage(playModToResource[mod]),
          modX,
          modY
        );
        modX = modX - 47;
      }
    }
  }

  async _drawCombo() {
    var xCombo = 47;
    var yCombo = 105;
    globalInstances.logMessage("| working on combo ");
    this.image.print(
      await resourceGetter.getFont("ubuntuBLightBlue32"),
      xCombo,
      yCombo,
      "Combo: "
    );
    this.image.print(
      await resourceGetter.getFont("ubuntuBWhite32"),
      xCombo + 118,
      yCombo,
      this.play.combo + " / " + this.play.maxCombo
    );
  }

  async _drawCounts() {
    globalInstances.logMessage("| working on counts ");
    var countY = 155;
    var count300 = this.play.countsObject.count_300;
    var count100 = this.play.countsObject.count_100;
    var count50 = this.play.countsObject.count_50;
    var countMiss = this.play.countsObject.count_miss;
    var blue = await resourceGetter.getFont("ubuntuBLightBlue32");
    var white = await resourceGetter.getFont("ubuntuBWhite32");
    var green = await resourceGetter.getFont("ubuntuBLightGreen32");
    var yellow = await resourceGetter.getFont("ubuntuBYellow32");
    var red = await resourceGetter.getFont("ubuntuBLightRed32");
    var fontToMeasureWith = blue;
    var totalLength = jimp.measureText(
      fontToMeasureWith,
      count300 + " / " + count100 + " / " + count50 + " / " + countMiss
    );
    var countX = 885 - totalLength;
    this.image.print(blue, countX, countY, count300);
    countX += jimp.measureText(fontToMeasureWith, count300 + "");
    this.image.print(white, countX, countY, " / ");
    countX += jimp.measureText(fontToMeasureWith, " / ");
    this.image.print(green, countX, countY, count100);
    countX += jimp.measureText(fontToMeasureWith, count100 + "");
    this.image.print(white, countX, countY, " / ");
    countX += jimp.measureText(fontToMeasureWith, " / ");
    this.image.print(yellow, countX, countY, count50);
    countX += jimp.measureText(fontToMeasureWith, count50 + "");
    this.image.print(white, countX, countY, " / ");
    countX += jimp.measureText(fontToMeasureWith, " / ");
    this.image.print(red, countX, countY, countMiss);
  }
}

module.exports = PlayImage;
