/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 * @typedef {import('./playObjectv2')} PlayObject
 */
const jimp = require('jimp');
const resourceGetter = require('./resourceGetter');
const { DrawTools } = require('./drawTools');
const globalInstances = require('./globalInstances');
const { secondsToDHMS } = require('./utils');

function truncateText(measure, text, maxWidth) {
  if (measure(text) <= maxWidth) return text;
  text += '...';
  while (text.length > 3 && measure(text) > maxWidth) {
    text = text.slice(0, -4) + '...';
  }
  return text;
}

const nTimes = (n) => ({
  next() {
    let value = n;
    return { value, done: !n || !n-- };
  },
  [Symbol.iterator]() {
    return this;
  },
});

/**
 * @template T, M
 * @param {{next() : {done: boolean, value: T}}} iter
 * @param {(memo: M, value: T) => M} cb
 * @param {M} memo
 */
const reduce = (iter, cb, memo) => {
  while (true) {
    let { done, value } = iter.next();
    if (done) break;
    memo = cb(memo, value);
  }
  return memo;
};

/**
 *
 * @param {(text: string) => number} measure
 * @param {string} text
 * @param {number} maxWidth
 */
function wrapText(measure, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = words.reduce((lines, word) => {
    const curLine = lines[lines.length - 1] || '';
    const nextWidth = measure(curLine + ' ' + word);
    if (nextWidth > maxWidth && measure(word) <= maxWidth) {
      lines.splice(lines.length - 1, 1, curLine);
    } else if (nextWidth > maxWidth) {
      // figure out where to split this word
    }
    return lines;
  }, []);
}

const PLAY_RANK_X_OFFSET = 774;
const PLAY_RANK_Y_OFFSET = 50;

const PLAY_RANK = {
  XH: ['rankSSPlus', 0],
  X: ['rankSS', 0],
  SH: ['rankSPlus', 0],
  S: ['rankS', 0],
  A: ['rankA', 10],
  B: ['rankB', 20],
  C: ['rankC', 20],
  D: ['rankD', 20],
};

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
      this.play.artist += ' <default bg>';
    }

    background.mask(await resourceGetter.getImage('playImageMask'), 0, 0);
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
    globalInstances.logMessage('| working on titles ');
    let version = this.play.version;
    if (version.length > 20) {
      version = version.substring(0, 20) + '...';
    }

    const lightBlue = await resourceGetter.getFont('ubuntuBLightBlue32');
    const white = await resourceGetter.getFont('ubuntuBWhite24');
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
        image.print(white, 5, y, '  by ' + artist, 1000);
      }
    );
  }

  /** @private */
  async _drawRank() {
    globalInstances.logMessage('| working on rank ');

    const [resource, xOffset] = PLAY_RANK[this.play.rank];

    this.image.composite(
      await resourceGetter.getImage(resource),
      PLAY_RANK_X_OFFSET + xOffset,
      PLAY_RANK_Y_OFFSET
    );
  }

  /** @private */
  async _drawAccuracy() {
    globalInstances.logMessage('| working on acc ');
    const gold = await resourceGetter.getFont('ubuntuBGold52');

    const yOffset = -9;
    let xOffset = this.image.getWidth() - 195;
    if (this.play.accuracy == '100.00') {
      xOffset -= 27;
    }
    this.image.print(gold, xOffset, yOffset, this.play.accuracy + '%');
  }

  /** @private */
  async _drawDifficulty() {
    globalInstances.logMessage('| working on difficulty ');
    const playStarY = 210;
    const stars = parseFloat(this.play.stars);
    const wholeStars = Math.floor(stars);
    const partialStar = stars % 1;

    const accum = this._printAccumulator(5, playStarY);
    let diffX = accum(
      await resourceGetter.getFont('ubuntuBLightBlue32'),
      'Difficulty: '
    );

    const diffText = `(${this.play.stars})`;
    const diffFont = await resourceGetter.getFont('ubuntuBWhite32');
    const diffWidth = jimp.measureText(diffFont, diffText);
    const diffHeight = jimp.measureTextHeight(diffFont, diffText, Infinity);

    const maxWidth = 505 - diffWidth;
    let star = await Promise.all(
      new Array(4)
        .fill(0)
        .map((_, i) => resourceGetter.getImage('onlineStar', i))
    );
    const starPadding = 1.08;
    const allStarsWidth = stars * star[0].getWidth() * starPadding;
    const starScale = allStarsWidth <= maxWidth ? 1 : maxWidth / allStarsWidth;

    if (starScale < 1) {
      star = star.map((s) => s.clone().scale(starScale));
    }

    const starOffsetY = star.map((s) => (diffHeight - s.getHeight()) / 2);

    let nextX = reduce(
      nTimes(wholeStars),
      (p) =>
        p.then((x) => {
          this.image.blit(star[0], x, playStarY + starOffsetY[0]);
          return x + star[0].getWidth() * starPadding;
        }),
      diffX
    );

    const partialStarSize = Math.floor((1 - partialStar) * 3);
    if (partialStarSize < 3) {
      nextX = nextX.then(async (x) => {
        const partialStar = star[partialStarSize + 1];
        this.image.composite(
          partialStar,
          x,
          playStarY +
            starOffsetY[partialStarSize + 1] +
            (partialStar.getHeight() - partialStar.getHeight()) / 2
        );
        return x + partialStar.getWidth() * starPadding;
      });
    }

    await nextX.then(async (x) => {
      const padding = starScale < 1 ? (1 - starScale) * star[0].getWidth() : 0;
      this.image.print(diffFont, x + padding, playStarY, diffText);
    });
  }

  async _drawSongDuration() {
    globalInstances.logMessage('| working on song duration ');
    const durationX = 16;
    const durationY = 175;
    const songDurationTotalSeconds = parseInt(this.play.duration);
    const [
      _,
      songDurationHours,
      songDurationMinutes,
      songDurationSeconds,
    ] = secondsToDHMS(songDurationTotalSeconds);
    const songDuration = globalInstances.convertTimeToHMS(
      songDurationHours,
      songDurationMinutes,
      songDurationSeconds
    );
    const accum = this._printAccumulator(durationX, durationY);
    await accum(
      await resourceGetter.getFont('ubuntuBLightBlue32'),
      'Duration: '
    );
    await accum(await resourceGetter.getFont('ubuntuBWhite32'), songDuration);
  }

  async _drawBPM() {
    const bpmX = 80;
    const bpmY = 140;
    const accum = this._printAccumulator(bpmX, bpmY);
    await accum(await resourceGetter.getFont('ubuntuBLightBlue32'), 'BPM: ');
    await accum(await resourceGetter.getFont('ubuntuBWhite32'), this.play.bpm);
  }

  async _drawPP() {
    globalInstances.logMessage('| working on pp ');
    const yPPOffset = 185;
    const xPPOffset = -18;
    const lengthOfPlayImage = 900;
    const pp = Math.ceil(this.play.pp) + 'pp';
    const lengthOfText = await jimp.measureText(
      await resourceGetter.getFont('ubuntuBGold52'),
      pp
    );
    this.image.print(
      await resourceGetter.getFont('ubuntuBGold52'),
      lengthOfPlayImage - lengthOfText + xPPOffset,
      yPPOffset,
      pp
    );
  }

  async _drawMods() {
    globalInstances.logMessage('| working on mods ');
    const modY = 120;
    let modX = this.image.getWidth() - 58;
    const playModToResource = {
      DT: 'modDoubleTime',
      NC: 'modNightcore',
      PF: 'modPerfect',
      HD: 'modHidden',
      SD: 'modSuddenDeath',
      FL: 'modFlashlight',
      HR: 'modHardRock',
      NF: 'modNoFail',
      EZ: 'modEasy',
    };
    for (const mod in playModToResource) {
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
    const xCombo = 47;
    const yCombo = 105;
    globalInstances.logMessage('| working on combo ');
    const accum = this._printAccumulator(xCombo, yCombo);
    await accum(await resourceGetter.getFont('ubuntuBLightBlue32'), 'Combo: ');
    await accum(
      await resourceGetter.getFont('ubuntuBWhite32'),
      `${this.play.combo} / ${this.play.maxCombo}`
    );
  }

  async _drawCounts() {
    globalInstances.logMessage('| working on counts ');
    const offsetY = 155;
    const {
      count_300: count300,
      count_100: count100,
      count_50: count50,
      count_miss: countMiss,
    } = this.play.countsObject;

    const blue = await resourceGetter.getFont('ubuntuBLightBlue32');
    const white = await resourceGetter.getFont('ubuntuBWhite32');
    const green = await resourceGetter.getFont('ubuntuBLightGreen32');
    const yellow = await resourceGetter.getFont('ubuntuBYellow32');
    const red = await resourceGetter.getFont('ubuntuBLightRed32');
    const fontToMeasureWith = blue;
    const totalLength = jimp.measureText(
      fontToMeasureWith,
      `${count300} / ${count100} / ${count50} / ${countMiss}`
    );
    let offsetX = this.image.getWidth() - 15 - totalLength;

    const accum = this._printAccumulator(offsetX, offsetY);
    await accum(blue, count300);
    await accum(white, ' / ');
    await accum(green, count100);
    await accum(white, ' / ');
    await accum(yellow, count50);
    await accum(white, ' / ');
    await accum(red, countMiss);
  }

  _printAccumulator(startX, y) {
    let p = Promise.resolve(startX);
    return (font, text) => {
      return (p = p.then(
        (x) =>
          new Promise((resolve, reject) =>
            this.image.print(font, x, y, `${text}`, (err, _, { x }) => {
              if (err) reject(err);
              resolve(x);
            })
          )
      ));
    };
  }
}

module.exports = PlayImage;
