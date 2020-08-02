/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 */
const jimp = require("jimp");
const resourceGetter = require("./resourceGetter");

const RANK_X_OFFSET = 55;
const RANK_Y_OFFSET = 40;

const GENERAL_X_OFFSET = 53;
const GENERAL_Y_OFFSET = -10;

const LEVEL_BAR_X_OFFSET = 0;
const LEVEL_BAR_Y_OFFSET = 5;

class DrawTools {
  /**
   * @param {Jimp} image
   */
  constructor(image) {
    this.image = image;
  }

  async _print(fontName, x, y, text) {
    let font = await resourceGetter.getFont(fontName);
    this.image.print(font, x, y, text);
  }

  async _printOffset(fontName, x, y, text) {
    return this._print(
      fontName,
      x + GENERAL_X_OFFSET,
      y + GENERAL_Y_OFFSET,
      text
    );
  }

  async _printCenteredX(fontName, x, y, text) {
    const font = await resourceGetter.getFont(fontName);
    const textWidth = jimp.measureText(font, text);
    this.image.print(font, x - textWidth / 2, y, text);
  }

  async _printCenteredY(fontName, x, y, text) {
    const font = await resourceGetter.getFont(fontName);
    const height = jimp.measureTextHeight(font, text, text.length);
    const [xsp, ysp] = font.info.spacing;
    return /** @type {Promise<{x: number, y: number}>} */ (new Promise(
      (resolve, reject) => {
        this.image.print(
          font,
          x + xsp,
          y - height / 2 + ysp / 2,
          text,
          (err, image, coords) => {
            if (err) reject(err);
            resolve(coords);
          }
        );
      }
    ));
  }

  async _cutReportCard() {
    this.image.resize(950, 498);
  }

  /**
   *
   * @param {Jimp} image
   * @param {*} fontName
   * @param {number} x
   * @param {number} y
   * @param {*} text
   */
  async _printCentered(image, fontName, x, y, text) {
    const font = await resourceGetter.getFont(fontName);
    const width = jimp.measureText(font, text);
    const height = jimp.measureTextHeight(font, text, text.length);

    const [xsp, ysp] = font.info.spacing;

    const top = y - height / 2 + ysp / 2;
    const left = x - width / 2 + xsp / 2;

    image.print(font, left, top, text);
  }

  // for debugging text bounds
  _drawBox(im, color, x, y, w, h) {
    for (let ix = 0; ix < w; ++ix) {
      im.setPixelColor(color, x + ix, y);
      im.setPixelColor(color, x + ix, y + h);
    }
    for (let iy = 0; iy < h; ++iy) {
      im.setPixelColor(color, x, y + iy);
      im.setPixelColor(color, x + w, y + iy);
    }
  }

  async _printDifferenceColor(x, y, offsetText, diff) {
    const blackFont = await resourceGetter.getFont("ubuntuBBlack32");
    const fontName = diff.includes("+") ? "ubuntuBGreen32" : "ubuntuBRed32";
    return this._printOffset(
      fontName,
      x + jimp.measureText(blackFont, offsetText),
      y,
      diff
    );
  }

  async _printRanks(fontName, x, y, rank) {
    rank = rank.toString();
    const font = await resourceGetter.getFont(fontName);
    return this.image.print(
      font,
      RANK_X_OFFSET + x - jimp.measureText(font, rank) * 0.7,
      y,
      rank
    );
  }

  async _drawCommands(thisCmd, commonArgs, ...cmds) {
    thisCmd = thisCmd.bind(this, ...commonArgs);
    // e.g. thisCmd(a, b, c) === this._printOffset("ubuntuBBlue32", a, b, c)
    await Promise.all(cmds.map(cmdArgs => thisCmd(...cmdArgs)));
  }
}

module.exports = {
  DrawTools,
  RANK_X_OFFSET,
  RANK_Y_OFFSET,
  GENERAL_X_OFFSET,
  GENERAL_Y_OFFSET,
  LEVEL_BAR_X_OFFSET,
  LEVEL_BAR_Y_OFFSET
};
