/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 */

const jimp = require("jimp");
const axios = require("axios").default;
const promisify = require("util").promisify;
const { URL } = require("url");
const _ = require("lodash");
const fs = require("fs");
const globalInstances = require("./globalInstances");
const fsPromises = fs.promises;

const DEFAULT_BACKGROUND =
  "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491";

/** @type { { [key: string]: (string | [string, ...(<T extends Jimp>(arg: T) => T)[]]) } } */
const INITIAL_IMAGES = {
  report: "./static/images/rawReports/report1.png",
  circleMask: "./static/masks/circleMask.png",
  rankSSPlus: ["./static/images/ranks/SSPlus.png", im => im.resize(120, 63.6)],
  rankSS: ["./static/images/ranks/SS.png", im => im.resize(120, 63.6)],
  rankSPlus: ["./static/images/ranks/SPlus.png", im => im.resize(120, 63.6)],
  rankS: ["./static/images/ranks/S.png", im => im.resize(120, 63.6)],
  rankA: ["./static/images/ranks/A.png", im => im.resize(109.2, 63.6)],
  rankB: ["./static/images/ranks/B.png", im => im.resize(95.16, 63.6)],
  rankC: ["./static/images/ranks/C.png", im => im.resize(95.16, 63.6)],
  rankD: ["./static/images/ranks/D.png", im => im.resize(95.16, 63.6)],
  osuReportsLogo: [
    "./static/images/osuReportsLogo.png",
    im => im.resize(100, 100)
  ],
  levelBar: "./static/images/levelBar.png",
  hex: "./static/images/hex.png",
  playImageMask: "./static/masks/playImageMask.png",
  playShadowMask: "./static/masks/playShadowMask.png",
  onlineStar: [
    "./static/images/stars/onlinestar.png",
    im => im.resize(35, 35),
    im => im.resize(28, 28),
    im => im.resize(20, 20),
    im => im.resize(15, 15)
  ],
  modFlashlight: "./static/images/mods/mod_flashlight.png",
  modHardRock: "./static/images/mods/mod_hard-rock.png",
  modHidden: "./static/images/mods/mod_hidden.png",
  modNightcore: "./static/images/mods/mod_nightcore.png",
  modPerfect: "./static/images/mods/mod_perfect.png",
  modSuddenDeath: "./static/images/mods/mod_sudden-death.png",
  modDoubleTime: "./static/images/mods/mod_double-time.png",
  modNoFail: "./static/images/mods/mod_no-fail.png",
  modEasy: "./static/images/mods/mod_easy.png",
  modHalfTime: "./static/images/mods/mod_half-time.png"
};

const INITIAL_FONTS = {
  ubuntuBBlue32: "./static/fonts/ubuntuB_blue_32.fnt",
  ubuntuBBlack32: "./static/fonts/ubuntuB_black_32.fnt",
  ubuntuBRed32: "./static/fonts/ubuntuB_red_32.fnt",
  ubuntuBGreen32: "./static/fonts/ubuntuB_green_32.fnt",
  ubuntuBBlack24: "./static/fonts/ubuntuB_black_24.fnt",
  ubuntuBGreen24: "./static/fonts/ubuntuB_green_24.fnt",
  ubuntuBRed24: "./static/fonts/ubuntuB_red_24.fnt",
  ubuntuBBlue24: "./static/fonts/ubuntuB_blue_24.fnt",
  ubuntuBLightBlue32: "./static/fonts/ubuntuB_lightblue_32.fnt",
  ubuntuBLightBlue24: "./static/fonts/ubuntuB_lightblue_24.fnt",
  ubuntuBWhite24: "./static/fonts/ubuntuB_white_24.fnt",
  ubuntuBWhite32: "./static/fonts/ubuntuB_white_32.fnt",
  ubuntuBGold52: "./static/fonts/ubuntuB_gold_52.fnt",
  ubuntuBYellow32: "./static/fonts/ubuntuB_yellow_32.fnt",
  ubuntuBLightGreen32: "./static/fonts/ubuntuB_lightgreen_32.fnt",
  ubuntuBLightRed32: "./static/fonts/ubuntuB_lightred_32.fnt"
};

class ResourceGetter {
  constructor() {
    const images = _.mapValues(INITIAL_IMAGES, resource => {
      let image = jimp.read(resource instanceof Array ? resource[0] : resource);

      if (resource instanceof Array) {
        let [_, ...mutations] = resource;
        if (mutations.length === 1) {
          return image.then(mutations[0]);
        } else {
          return mutations.map(mut =>
            image.then(image => promisify(image.clone.bind(image))().then(mut))
          );
        }
      } else {
        return image;
      }
    });

    const fonts = _.mapValues(INITIAL_FONTS, url => jimp.loadFont(url));

    this.cache = {
      images,
      fonts
    };

    /** @type {LRUCache<Jimp>} */
    this.lru = new LRUCache(50);
  }

  async getPlayerAvatar(userId) {
    const url = "https://a.ppy.sh/" + userId;
    return jimp.read(url).then(im => im.resize(256, 256));
  }

  async getPlayerCountryFlag(countryFlag) {
    const url = "./static/images/flags/" + countryFlag + ".png";
    const key = `countryFlag_${countryFlag}`;
    return fsPromises
      .access(url, fs.constants.F_OK)
      .then(() => {
        return this.getAndCacheImage(key, url);
      })
      .catch(() => {
        if (countryFlag !== "__") {
          globalInstances.logMessage(
            `Default flag being used since ${countryFlag}.png does not exist.`
          );
          return this.getPlayerCountryFlag("__");
        } else {
          globalInstances.logMessage(
            "Error: __.png (default flag) does not exist."
          );
          throw new Error();
        }
      });
  }

  async getAndCacheImage(key, url) {
    if (key in this.cache.images) {
      let image = await /** @type {Promise<Jimp>} */ (this.cache.images[key]);
      return image;
    }
    let p = jimp.read(url);
    this.cache.images[key] = p;
    return p;
  }

  async getImage(key, variant = undefined) {
    let resource = this.cache.images[key];
    if (resource instanceof Array) {
      return resource[variant || 0];
    }
    return resource;
  }

  /**
   * Gets a font by name
   * @param {keyof INITIAL_FONTS} name
   */
  async getFont(name) {
    if (name in this.cache.fonts) {
      return this.cache.fonts[name];
    }
    throw new Error(`Requested font ${name} does not exist`);
  }

  async getNewReportTemplate() {
    const key = "_reportTemplate";
    if (key in this.cache.images) {
      const p = /** @type {Promise<Jimp>} */ (this.cache.images[key]);
      return p.then(im => im.clone());
    }

    const template = (await this.getImage("report")).clone();
    const logo = await this.getImage("osuReportsLogo");

    const overlayed = /** @type {Promise<Jimp>} */ (promisify(
      template.blit
    ).bind(template)(logo, 840, 10));
    this.cache.images[key] = overlayed;
    return overlayed.then(im => promisify(im.clone).bind(im)());
  }

  /**
   * Fetch an OSU background by URL
   * @param {string} url
   */
  async getBackground(url) {
    const parsed = new URL(url);
    const getter = url =>
      axios
        .get(url, {
          responseType: "arraybuffer"
        })
        .then(data => {
          return jimp.read(data.data);
        });
    let isDefault = false;

    if (parsed.search === "0") {
      // this background does not exist, return default
      url = DEFAULT_BACKGROUND;
      isDefault = true;
    }

    return this.lru
      .get(url, () => getter(url))
      .then(background => ({
        background: background.clone(),
        isDefault
      }))
      .catch(async err => {
        if ("response" in err && err.response.status === 404) {
          return this.lru
            .get(DEFAULT_BACKGROUND, () => getter(DEFAULT_BACKGROUND))
            .then(background => ({
              background: background.clone(),
              isDefault: true
            }));
        }
        throw err;
      });
  }
}

/**
 * @template T - the type being cached
 */
class LRUCache {
  /**
   * Creates a new LRU cache
   * @param {number} maxSize The size of the LRU cache
   */
  constructor(maxSize) {
    this.maxSize = maxSize;

    /**
     * contains the key: value lookups
     * @private
     * @type { { [key: string]: T } }
     */
    this.cache = {};

    /**
     * this will contain the order in which the keys were last accessed
     * @private
     * @type { string[] }
     */
    this.accessed = [];
  }

  /**
   * Retrieves a value from the LRU cache or fetches it if it does not exist
   * @param {string} key The key to retrieve from the LRU cache
   * @param {() => Promise<T>} getter Called to create the value if it's not cached
   */
  async get(key, getter) {
    if (key in this.cache) {
      const idx = this.accessed.indexOf(key);
      if (idx === -1) {
        throw new Error("key was in cached, but not accessed list");
      }
      this.accessed.splice(idx, 1);
      this.accessed.unshift(key);
      return this.cache[key];
    }

    const toBeCached = await getter();
    if (this.accessed.length === this.maxSize) {
      const toBeDeleted = this.accessed.pop();
      delete this.cache[toBeDeleted];
    }
    this.cache[key] = toBeCached;
    this.accessed.unshift(key);
    return toBeCached;
  }
}

module.exports = new ResourceGetter();
