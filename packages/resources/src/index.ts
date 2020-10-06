import jimp from "jimp";
import { Font } from "@jimp/plugin-print";
import axios from "axios";
import { promisify } from "util";
import { URL } from "url";
import _ from "lodash";
import fs, { promises as fsPromises } from "fs";

const DEFAULT_BACKGROUND =
  "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491";

const INITIAL_IMAGES: {
  [key: string]: string | [string, ...(<T extends jimp>(arg: T) => T)[]];
} = {
  report: require.resolve("../static/images/rawReports/report1.png"),
  circleMask: require.resolve("../static/masks/circleMask.png"),
  rankSSPlus: [
    require.resolve("../static/images/ranks/SSPlus.png"),
    im => im.resize(120, 63.6)
  ],
  rankSS: [
    require.resolve("../static/images/ranks/SS.png"),
    im => im.resize(120, 63.6)
  ],
  rankSPlus: [
    require.resolve("../static/images/ranks/SPlus.png"),
    im => im.resize(120, 63.6)
  ],
  rankS: [
    require.resolve("../static/images/ranks/S.png"),
    im => im.resize(120, 63.6)
  ],
  rankA: [
    require.resolve("../static/images/ranks/A.png"),
    im => im.resize(109.2, 63.6)
  ],
  rankB: [
    require.resolve("../static/images/ranks/B.png"),
    im => im.resize(95.16, 63.6)
  ],
  rankC: [
    require.resolve("../static/images/ranks/C.png"),
    im => im.resize(95.16, 63.6)
  ],
  rankD: [
    require.resolve("../static/images/ranks/D.png"),
    im => im.resize(95.16, 63.6)
  ],
  osuReportsLogo: [
    require.resolve("../static/images/osuReportsLogo.png"),
    im => im.resize(100, 100)
  ],
  levelBar: require.resolve("../static/images/levelBar.png"),
  hex: require.resolve("../static/images/hex.png"),
  playImageMask: require.resolve("../static/masks/playImageMask.png"),
  playShadowMask: require.resolve("../static/masks/playShadowMask.png"),
  onlineStar: [
    require.resolve("../static/images/stars/onlinestar.png"),
    im => im.resize(35, 35),
    im => im.resize(28, 28),
    im => im.resize(20, 20),
    im => im.resize(15, 15)
  ],
  modFlashlight: require.resolve("../static/images/mods/mod_flashlight.png"),
  modHardRock: require.resolve("../static/images/mods/mod_hard-rock.png"),
  modHidden: require.resolve("../static/images/mods/mod_hidden.png"),
  modNightcore: require.resolve("../static/images/mods/mod_nightcore.png"),
  modPerfect: require.resolve("../static/images/mods/mod_perfect.png"),
  modSuddenDeath: require.resolve("../static/images/mods/mod_sudden-death.png"),
  modDoubleTime: require.resolve("../static/images/mods/mod_double-time.png"),
  modNoFail: require.resolve("../static/images/mods/mod_no-fail.png"),
  modEasy: require.resolve("../static/images/mods/mod_easy.png"),
  modHalfTime: require.resolve("../static/images/mods/mod_half-time.png")
};

const INITIAL_FONTS = {
  ubuntuBBlue32: require.resolve("../static/fonts/ubuntuB_blue_32.fnt"),
  ubuntuBBlack32: require.resolve("../static/fonts/ubuntuB_black_32.fnt"),
  ubuntuBRed32: require.resolve("../static/fonts/ubuntuB_red_32.fnt"),
  ubuntuBGreen32: require.resolve("../static/fonts/ubuntuB_green_32.fnt"),
  ubuntuBBlack24: require.resolve("../static/fonts/ubuntuB_black_24.fnt"),
  ubuntuBGreen24: require.resolve("../static/fonts/ubuntuB_green_24.fnt"),
  ubuntuBRed24: require.resolve("../static/fonts/ubuntuB_red_24.fnt"),
  ubuntuBBlue24: require.resolve("../static/fonts/ubuntuB_blue_24.fnt"),
  ubuntuBLightBlue32: require.resolve(
    "../static/fonts/ubuntuB_lightblue_32.fnt"
  ),
  ubuntuBLightBlue24: require.resolve(
    "../static/fonts/ubuntuB_lightblue_24.fnt"
  ),
  ubuntuBWhite24: require.resolve("../static/fonts/ubuntuB_white_24.fnt"),
  ubuntuBWhite32: require.resolve("../static/fonts/ubuntuB_white_32.fnt"),
  ubuntuBGold52: require.resolve("../static/fonts/ubuntuB_gold_52.fnt"),
  ubuntuBYellow32: require.resolve("../static/fonts/ubuntuB_yellow_32.fnt"),
  ubuntuBLightGreen32: require.resolve(
    "../static/fonts/ubuntuB_lightgreen_32.fnt"
  ),
  ubuntuBLightRed32: require.resolve("../static/fonts/ubuntuB_lightred_32.fnt")
};

class ResourceGetter {
  protected cache: {
    images: Record<string, Promise<jimp> | Promise<jimp>[]>;
    fonts: Record<keyof typeof INITIAL_FONTS, Promise<Font>>;
  };
  protected lru: LRUCache<jimp>;

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

    this.lru = new LRUCache(50);
  }

  async getPlayerAvatar(userId) {
    const url = "https://a.ppy.sh/" + userId;
    return jimp.read(url).then(im => im.resize(256, 256));
  }

  async getPlayerCountryFlag(countryFlag) {
    const url = require.resolve(
      "../static/images/flags/" + countryFlag + ".png"
    );
    const key = `countryFlag_${countryFlag}`;
    return fsPromises
      .access(url, fs.constants.F_OK)
      .then(() => {
        return this.getAndCacheImage(key, url);
      })
      .catch(() => {
        if (countryFlag !== "__") {
          console.warn(
            `Default flag being used since ${countryFlag}.png does not exist.`
          );
          return this.getPlayerCountryFlag("__");
        } else {
          console.warn("Error: __.png (default flag) does not exist.");
          throw new Error();
        }
      });
  }

  async getAndCacheImage(key, url) {
    if (key in this.cache.images) {
      let image = await (this.cache.images[key] as Promise<jimp>);
      return image;
    }
    let p = jimp.read(url);
    this.cache.images[key] = p;
    return p;
  }

  async getImage(key, variant: number | undefined = undefined) {
    let resource = this.cache.images[key];
    if (resource instanceof Array) {
      return resource[variant || 0];
    }
    return resource;
  }

  /**
   * Gets a font by name
   * @param name
   */
  async getFont(name: keyof typeof INITIAL_FONTS) {
    if (name in this.cache.fonts) {
      return this.cache.fonts[name];
    }
    throw new Error(`Requested font ${name} does not exist`);
  }

  async getNewReportTemplate() {
    const key = "_reportTemplate";
    if (key in this.cache.images) {
      const p = this.cache.images[key] as Promise<jimp>;
      return p.then(im => im.clone());
    }

    const template = (await this.getImage("report")).clone();
    const logo = await this.getImage("osuReportsLogo");

    const overlayed = promisify(template.blit).bind(template)(
      logo,
      840,
      10
    ) as Promise<jimp>;
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

class LRUCache<T> {
  /**
   * contains the key: value lookups
   */

  protected cache: { [key: string]: T };

  /**
   * this will contain the order in which the keys were last accessed
   * @private
   * @type { string[] }
   */
  protected accessed: string[];

  /**
   * Creates a new LRU cache
   * @param {number} maxSize The size of the LRU cache
   */
  constructor(protected maxSize: number) {
    this.cache = {};
    this.accessed = [];
  }

  /**
   * Retrieves a value from the LRU cache or fetches it if it does not exist
   * @param key The key to retrieve from the LRU cache
   * @param getter Called to create the value if it's not cached
   */
  async get(key: string, getter: () => Promise<T>): Promise<T> {
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
      delete this.cache[toBeDeleted!];
    }
    this.cache[key] = toBeCached;
    this.accessed.unshift(key);
    return toBeCached;
  }
}

export = new ResourceGetter();
