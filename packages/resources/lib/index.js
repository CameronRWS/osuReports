"use strict";
const tslib_1 = require("tslib");
const jimp_1 = tslib_1.__importDefault(require("jimp"));
require("@jimp/plugin-print");
const axios_1 = tslib_1.__importDefault(require("axios"));
const util_1 = require("util");
const url_1 = require("url");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const fs_1 = tslib_1.__importStar(require("fs"));
const DEFAULT_BACKGROUND = "https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491";
const INITIAL_IMAGES = {
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
    ubuntuBLightBlue32: require.resolve("../static/fonts/ubuntuB_lightblue_32.fnt"),
    ubuntuBLightBlue24: require.resolve("../static/fonts/ubuntuB_lightblue_24.fnt"),
    ubuntuBWhite24: require.resolve("../static/fonts/ubuntuB_white_24.fnt"),
    ubuntuBWhite32: require.resolve("../static/fonts/ubuntuB_white_32.fnt"),
    ubuntuBGold52: require.resolve("../static/fonts/ubuntuB_gold_52.fnt"),
    ubuntuBYellow32: require.resolve("../static/fonts/ubuntuB_yellow_32.fnt"),
    ubuntuBLightGreen32: require.resolve("../static/fonts/ubuntuB_lightgreen_32.fnt"),
    ubuntuBLightRed32: require.resolve("../static/fonts/ubuntuB_lightred_32.fnt")
};
class ResourceGetter {
    constructor() {
        const images = lodash_1.default.mapValues(INITIAL_IMAGES, resource => {
            let image = jimp_1.default.read(resource instanceof Array ? resource[0] : resource);
            if (resource instanceof Array) {
                let [_, ...mutations] = resource;
                if (mutations.length === 1) {
                    return image.then(mutations[0]);
                }
                else {
                    return mutations.map(mut => image.then(image => util_1.promisify(image.clone.bind(image))().then(mut)));
                }
            }
            else {
                return image;
            }
        });
        const fonts = lodash_1.default.mapValues(INITIAL_FONTS, url => jimp_1.default.loadFont(url));
        this.cache = {
            images,
            fonts
        };
        this.lru = new LRUCache(50);
    }
    getPlayerAvatar(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const url = "https://a.ppy.sh/" + userId;
            return jimp_1.default.read(url).then(im => im.resize(256, 256));
        });
    }
    getPlayerCountryFlag(countryFlag) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const url = require.resolve("../static/images/flags/" + countryFlag + ".png");
            const key = `countryFlag_${countryFlag}`;
            return fs_1.promises
                .access(url, fs_1.default.constants.F_OK)
                .then(() => {
                return this.getAndCacheImage(key, url);
            })
                .catch(() => {
                if (countryFlag !== "__") {
                    console.warn(`Default flag being used since ${countryFlag}.png does not exist.`);
                    return this.getPlayerCountryFlag("__");
                }
                else {
                    console.warn("Error: __.png (default flag) does not exist.");
                    throw new Error();
                }
            });
        });
    }
    getAndCacheImage(key, url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (key in this.cache.images) {
                let image = yield this.cache.images[key];
                return image;
            }
            let p = jimp_1.default.read(url);
            this.cache.images[key] = p;
            return p;
        });
    }
    getImage(key, variant = undefined) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let resource = this.cache.images[key];
            if (resource instanceof Array) {
                return resource[variant || 0];
            }
            return resource;
        });
    }
    /**
     * Gets a font by name
     * @param name
     */
    getFont(name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (name in this.cache.fonts) {
                return this.cache.fonts[name];
            }
            throw new Error(`Requested font ${name} does not exist`);
        });
    }
    getNewReportTemplate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const key = "_reportTemplate";
            if (key in this.cache.images) {
                const p = this.cache.images[key];
                return p.then(im => im.clone());
            }
            const template = (yield this.getImage("report")).clone();
            const logo = yield this.getImage("osuReportsLogo");
            const overlayed = util_1.promisify(template.blit).bind(template)(logo, 840, 10);
            this.cache.images[key] = overlayed;
            return overlayed.then(im => util_1.promisify(im.clone).bind(im)());
        });
    }
    /**
     * Fetch an OSU background by URL
     * @param {string} url
     */
    getBackground(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const parsed = new url_1.URL(url);
            const getter = url => axios_1.default
                .get(url, {
                responseType: "arraybuffer"
            })
                .then(data => {
                return jimp_1.default.read(data.data);
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
                .catch((err) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if ("response" in err && err.response.status === 404) {
                    return this.lru
                        .get(DEFAULT_BACKGROUND, () => getter(DEFAULT_BACKGROUND))
                        .then(background => ({
                        background: background.clone(),
                        isDefault: true
                    }));
                }
                throw err;
            }));
        });
    }
}
class LRUCache {
    /**
     * Creates a new LRU cache
     * @param {number} maxSize The size of the LRU cache
     */
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = {};
        this.accessed = [];
    }
    /**
     * Retrieves a value from the LRU cache or fetches it if it does not exist
     * @param key The key to retrieve from the LRU cache
     * @param getter Called to create the value if it's not cached
     */
    get(key, getter) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (key in this.cache) {
                const idx = this.accessed.indexOf(key);
                if (idx === -1) {
                    throw new Error("key was in cached, but not accessed list");
                }
                this.accessed.splice(idx, 1);
                this.accessed.unshift(key);
                return this.cache[key];
            }
            const toBeCached = yield getter();
            if (this.accessed.length === this.maxSize) {
                const toBeDeleted = this.accessed.pop();
                delete this.cache[toBeDeleted];
            }
            this.cache[key] = toBeCached;
            this.accessed.unshift(key);
            return toBeCached;
        });
    }
}
module.exports = new ResourceGetter();
//# sourceMappingURL=index.js.map