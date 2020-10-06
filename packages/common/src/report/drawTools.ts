import jimp from "jimp";
import resourceGetter from "@osureport/resources";

export const RANK_X_OFFSET = 55;
export const RANK_Y_OFFSET = 40;

export const GENERAL_X_OFFSET = 53;
export const GENERAL_Y_OFFSET = -10;

export const LEVEL_BAR_X_OFFSET = 0;
export const LEVEL_BAR_Y_OFFSET = 5;

export class DrawTools {
  constructor(protected image: jimp) {}

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
    return new Promise((resolve, reject) => {
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
    }) as Promise<{ x: number; y: number }>;
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
    const blackFont = await resourceGetter.getFont("ubuntuBBlack24");
    const fontName = diff.includes("+") ? "ubuntuBGreen24" : "ubuntuBRed24";
    return this._printOffset(
      fontName,
      x + jimp.measureText(blackFont, offsetText),
      y,
      diff
    );
  }

  async _printRankCounts(x, y, offsetText, diff) {
    console.log(`${x} ${y} ${offsetText} ${diff}`);
    const blackFont = await resourceGetter.getFont("ubuntuBBlack24");
    const fontName = "ubuntuBBlue24";
    return this._printOffset(
      fontName,
      x + jimp.measureText(blackFont, offsetText),
      y,
      diff
    );
  }

  async _printRanks(x, y, rank, dif) {
    rank = parseInt(rank)
      .toLocaleString("US-en")
      .toString();
    const blackFont = await resourceGetter.getFont("ubuntuBBlack24");
    const blueFont = await resourceGetter.getFont(
      dif.includes("+") ? "ubuntuBGreen24" : "ubuntuBRed24"
    );
    await this.image.print(
      blackFont,
      RANK_X_OFFSET + x - jimp.measureText(blackFont, rank + dif) * 0.6,
      y,
      rank
    );
    return this.image.print(
      blueFont,
      RANK_X_OFFSET +
        x -
        jimp.measureText(blackFont, rank + dif) * 0.6 +
        jimp.measureText(blackFont, rank),
      y,
      dif
    );
  }

  async _drawCommands(thisCmd, commonArgs, ...cmds) {
    thisCmd = thisCmd.bind(this, ...commonArgs);
    // e.g. thisCmd(a, b, c) === this._printOffset("ubuntuBBlue32", a, b, c)
    await Promise.all(cmds.map(cmdArgs => thisCmd(...cmdArgs)));
  }
}
