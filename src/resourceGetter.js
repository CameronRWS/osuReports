const jimp = require("jimp");
const axios = require("axios");
const promisify = require("util").promisify;

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

const INITIAL_RESOURCES = {
  report: "./static/images/rawReports/report1.png",
  circleMask: "./static/masks/circleMask.png",
  rankSsPlus: [
    "./static/images/ranks/SSPlus.png",
    (im) => im.resize(120, 63.6),
  ],
  rankSs: ["./static/images/ranks/SS.png", (im) => im.resize(120, 63.6)],
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

class ResourceGetter {
  constructor() {
    this.cache = {};
    for (const key in INITIAL_RESOURCES) {
      let resource = INITIAL_RESOURCES[key];
      let image = jimp.read(resource instanceof Array ? resource[0] : resource);

      if (resource instanceof Array) {
        let mutations = resource.slice(1);
        if (mutations.length === 1) {
          this.cache[key] = image.then(mutations[0]);
        } else {
          this.cache[key] = mutations.map((mut) =>
            image.then((image) =>
              promisify(image.clone.bind(image))().then(mut)
            )
          );
        }
      } else {
        this.cache[key] = image;
      }
    }
  }

  async getPlayerAvatar(userId) {
    const url = "https://a.ppy.sh/" + userId;
    return jimp.read(url).then((im) => im.resize(256, 256));
  }

  async getPlayerCountryFlag(countryFlag) {
    const key = `countryFlag_${countryFlag}`;
    const url = "./static/images/flags/" + countryFlag + ".png";
    return this.getAndCache(key, url);
  }

  async getAndCache(key, url) {
    if (key in this.cache) {
      let image = await this.cache[key];
      return image;
    }
    let p = jimp.read(url);
    this.cache[key] = p;
    return p;
  }

  async getResource(key, n) {
    let resource = this.cache[key];
    if (resource instanceof Array) {
      return resource[n || 0];
    }
    return resource;
  }

  async getNewReportTemplate() {
    const key = "_reportTemplate";
    if (key in this.cache) {
      return this.cache[key].clone();
    }

    const template = await this.cache["report"];
    const logo = await this.cache["osuReportsLogo"];

    const overlayed = promisify(template.composite.bind(template))(
      logo,
      840,
      10
    );
    this.cache[key] = overlayed;
    return overlayed.then((im) => promisify(im.clone.bind(im))());
  }
}

module.exports = new ResourceGetter();
