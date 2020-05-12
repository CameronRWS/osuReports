/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 * @typedef {import('./playObjectv2')} PlayObject
 */
const jimp = require('jimp');
const resourceGetter = require('./resourceGetter');
const { DrawTools } = require('./drawTools');
const globalInstances = require('./globalInstances');

function truncateText(measure, text, maxWidth) {
  if (measure(text) <= maxWidth) return text;
  text += '...';
  while (text.length > 3 && measure(text) > maxWidth) {
    text = text.slice(0, -4) + '...';
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
}

module.exports = PlayImage;
