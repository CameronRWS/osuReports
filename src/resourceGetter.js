const jimp = require("jimp");
const axios = require("axios");
const promisify = require("util").promisify;
const { URL } = require("url");
const util = require("util");

/*var images = [
          "./static/images/rawReports/report1.png",
          "./static/images/rawReports/report2.png",
          "./static/images/rawReports/report3.png",
          "./static/images/rawReports/report4.png",
          "https://a.ppy.sh/" + this.userObjectStartOfSession.id,
          "./static/images/flags/" +
            this.userObjectStartOfSession.country +
            ".png",
          "./static/masks/circleMask.png",
          "./static/images/ranks/SSPlus.png",
          "./static/images/ranks/SS.png",
          "./static/images/ranks/SPlus.png",
          "./static/images/ranks/S.png",
          "./static/images/ranks/A.png",
          "./static/images/ranks/B.png",
          "./static/images/ranks/C.png",
          "./static/images/osuReportsLogo.png",
          "./static/images/levelBar.png",
          "./static/images/hex.png",
          "./static/masks/playImageMask.png",
          "./static/masks/playShadowMask.png",
          "./static/images/stars/onlinestar.png",
          "./static/images/stars/onlinestar.png",
          "./static/images/stars/onlinestar.png",
          "./static/images/stars/onlinestar.png",
          "./static/images/mods/mod_flashlight.png",
          "./static/images/mods/mod_hard-rock.png",
          "./static/images/mods/mod_hidden.png",
          "./static/images/mods/mod_nightcore.png",
          "./static/images/mods/mod_perfect.png",
          "./static/images/mods/mod_sudden-death.png",
          "./static/images/mods/mod_double-time.png",
          "./static/images/ranks/D.png",
          "./static/images/mods/mod_no-fail.png",
          "./static/images/mods/mod_easy.png",
        ]; */

/*  data[4].resize(256, 256); // user avatar
                data[7].resize(120, 63.6); //SSPlus
                data[8].resize(120, 63.6); //SS
                data[9].resize(120, 63.6); //SPlus
                data[10].resize(120, 63.6); //S
                data[11].resize(109.2, 63.6); //A
                data[12].resize(95.16, 63.6); //B
                data[13].resize(95.16, 63.6); //C
                data[30].resize(95.16, 63.6); //D
                data[19].resize(35, 35); //star
                data[20].resize(28, 28); //star
                data[21].resize(20, 20); //star
                data[22].resize(15, 15); //star
                data[14].resize(100, 100);
                data[0].composite(data[14], 840, 10); */

/*
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_blue_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_black_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_red_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_green_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_black_24.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_green_24.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_blue_24.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_lightblue_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_white_24.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_white_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_gold_52.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_yellow_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_lightgreen_32.fnt")
                );
                fontsPromises.push(
                  jimp.loadFont("./static/fonts/ubuntuB_lightred_32.fnt")
                );
*/

const DEFAULT_BACKGROUND =
  "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491";

const INITIAL_IMAGES = {
  report: "./static/images/rawReports/report1.png",
  circleMask: "./static/masks/circleMask.png",
  rankSSPlus: [
    "./static/images/ranks/SSPlus.png",
    (im) => im.resize(120, 63.6),
  ],
  rankSS: ["./static/images/ranks/SS.png", (im) => im.resize(120, 63.6)],
  rankSPlus: ["./static/images/ranks/SPlus.png", (im) => im.resize(120, 63.6)],
  rankS: ["./static/images/ranks/S.png", (im) => im.resize(120, 63.6)],
  rankA: ["./static/images/ranks/A.png", (im) => im.resize(109.2, 63.6)],
  rankB: ["./static/images/ranks/B.png", (im) => im.resize(95.16, 63.6)],
  rankC: ["./static/images/ranks/C.png", (im) => im.resize(95.16, 63.6)],
  rankD: ["./static/images/ranks/D.png", (im) => im.resize(95.16, 63.6)],
  osuReportsLogo: [
    "./static/images/osuReportsLogo.png",
    (im) => im.resize(100, 100),
  ],
  levelBar: "./static/images/levelBar.png",
  hex: "./static/images/hex.png",
  playImageMask: "./static/masks/playImageMask.png",
  playShadowMask: "./static/masks/playShadowMask.png",
  onlineStar: [
    "./static/images/stars/onlinestar.png",
    (im) => im.resize(35, 35),
    (im) => im.resize(28, 28),
    (im) => im.resize(20, 20),
    (im) => im.resize(15, 15),
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
};

const INITIAL_FONTS = {
  ubuntuBBlue32: "./static/fonts/ubuntuB_blue_32.fnt",
  ubuntuBBlack32: "./static/fonts/ubuntuB_black_32.fnt",
  ubuntuBRed32: "./static/fonts/ubuntuB_red_32.fnt",
  ubuntuBGreen32: "./static/fonts/ubuntuB_green_32.fnt",
  ubuntuBBlack24: "./static/fonts/ubuntuB_black_24.fnt",
  ubuntuBGreen24: "./static/fonts/ubuntuB_green_24.fnt",
  ubuntuBBlue24: "./static/fonts/ubuntuB_blue_24.fnt",
  ubuntuBLightBlue32: "./static/fonts/ubuntuB_lightblue_32.fnt",
  ubuntuBWhite24: "./static/fonts/ubuntuB_white_24.fnt",
  ubuntuBWhite32: "./static/fonts/ubuntuB_white_32.fnt",
  ubuntuBGold52: "./static/fonts/ubuntuB_gold_52.fnt",
  ubuntuBYellow32: "./static/fonts/ubuntuB_yellow_32.fnt",
  ubuntuBLightGreen32: "./static/fonts/ubuntuB_lightgreen_32.fnt",
  ubuntuBLightRed32: "./static/fonts/ubuntuB_lightred_32.fnt",
};

class ResourceGetter {
  constructor() {
    this.cache = {
      images: {},
      fonts: {},
    };
    for (const key in INITIAL_IMAGES) {
      let resource = INITIAL_IMAGES[key];
      let image = jimp.read(resource instanceof Array ? resource[0] : resource);

      if (resource instanceof Array) {
        let mutations = resource.slice(1);
        if (mutations.length === 1) {
          this.cache.images[key] = image.then(mutations[0]);
        } else {
          this.cache.images[key] = mutations.map((mut) =>
            image.then((image) =>
              promisify(image.clone.bind(image))().then(mut)
            )
          );
        }
      } else {
        this.cache.images[key] = image;
      }
    }
    for (const key in INITIAL_FONTS) {
      let url = INITIAL_FONTS[key];
      let font = jimp.loadFont(url);
      this.cache.fonts[key] = font;
    }

    this.lru = new LRUCache(50);
  }

  async getPlayerAvatar(userId) {
    const url = "https://a.ppy.sh/" + userId;
    return jimp.read(url).then((im) => im.resize(256, 256));
  }

  async getPlayerCountryFlag(countryFlag) {
    const key = `countryFlag_${countryFlag}`;
    const url = "./static/images/flags/" + countryFlag + ".png";
    return this.getAndCacheImage(key, url);
  }

  async getAndCacheImage(key, url) {
    if (key in this.cache.images) {
      let image = await this.cache.images[key];
      return image;
    }
    let p = jimp.read(url);
    this.cache.images[key] = p;
    return p;
  }

  async getImage(key, variant) {
    let resource = this.cache.images[key];
    if (resource instanceof Array) {
      return resource[variant || 0];
    }
    return resource;
  }

  async getFont(key) {
    if (key in this.cache.fonts) {
      return this.cache.fonts[key];
    }
    throw new Error(`Requested font ${key} does not exist`);
  }

  async getNewReportTemplate() {
    const key = "_reportTemplate";
    if (key in this.cache.images) {
      return this.cache.images[key].clone();
    }

    const template = (await this.cache.images["report"]).clone();
    const logo = await this.cache.images["osuReportsLogo"];

    const overlayed = promisify(template.composite.bind(template))(
      logo,
      840,
      10
    );
    this.cache.images[key] = overlayed;
    return overlayed.then((im) => promisify(im.clone.bind(im))());
  }

  async getBackground(url) {
    const parsed = new URL(url);
    const getter = (url) =>
      axios.get(url, { responseType: "arraybuffer" }).then((data) => {
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
      .then((background) => ({
        background: background.clone(),
        isDefault,
      }))
      .catch((err) => {
        if ("response" in err && err.response.status === 404) {
          return this.lru
            .get(DEFAULT_BACKGROUND, () => getter(DEFAULT_BACKGROUND))
            .then((background) => ({
              background: background.clone(),
              isDefault: true,
            }));
        }
        throw err;
      });
  }
}

class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;

    // this will contain the key: value lookups
    this.cache = {};

    // this will contain the order in which the keys were last accessed
    this.accessed = [];
  }

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
