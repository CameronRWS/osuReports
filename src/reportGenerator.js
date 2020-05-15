/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 */

const _ = require("lodash");
const axios = require("axios");

const jimp = require("jimp");
const { promisify } = require("util");

const globalInstances = require("./globalInstances");
const resourceGetter = require("./resourceGetter");

const { secondsToDHMS } = require("./utils");
const {
  DrawTools,
  GENERAL_X_OFFSET,
  GENERAL_Y_OFFSET,
  LEVEL_BAR_X_OFFSET,
  LEVEL_BAR_Y_OFFSET,
  RANK_X_OFFSET,
  RANK_Y_OFFSET,
} = require("./drawTools");
const PlayImage = require("./playImage");

class Report extends DrawTools {
  /**
   *
   * @param {Jimp} template
   * @param {*} player
   * @param {*} user
   * @param {*} sessionDuration
   * @param {*} date
   * @param {*} delta
   */
  constructor(template, player, user, sessionDuration, date, delta) {
    super(template);

    this.player = player;
    this.user = user;
    this.sessionDuration = sessionDuration;
    this.date = date;
    this.delta = delta;
  }

  get globalRank() {
    return "#" + parseFloat(this.user.pp.rank).toLocaleString("en");
  }

  get countryRank() {
    return "#" + parseFloat(this.user.pp.countryRank).toLocaleString("en");
  }

  get accuracy() {
    return parseFloat(this.user.accuracy).toFixed(2) + "%";
  }

  get pp() {
    return parseFloat(this.user.pp.raw).toLocaleString("en");
  }

  get plays() {
    return parseFloat(this.user.counts.plays).toLocaleString("en");
  }

  async generateBase() {
    await this._drawRanks();
    await this._drawAvatar();
    await this._drawFlag();
    return this.image;
  }

  async generate() {
    await this._drawSessionInfo();
    await this._drawSessionFields();
    await this._drawDifferences();
    await this._drawLevels();
  }

  async _drawRanks() {
    await this._drawCommands(
      this._drawRank,
      [],
      ["rankSSPlus", 220, 305],
      ["rankSS", 340, 305],
      ["rankSPlus", 460, 305],
      ["rankS", 580, 305],
      ["rankA", 700, 305]
    );

    const { SSH, SS, SH, S, A } = this.user.counts;
    await this._drawCommands(
      this._printRanks,
      ["ubuntuBBlack24"],
      [280, 365 + RANK_Y_OFFSET, SSH],
      [400, 365 + RANK_Y_OFFSET, SS],
      [520, 365 + RANK_Y_OFFSET, SH],
      [640, 365 + RANK_Y_OFFSET, S],
      [760, 365 + RANK_Y_OFFSET, A]
    );
  }

  async _drawRank(resource, x, y) {
    this.image.composite(
      await resourceGetter.getImage(resource),
      x + RANK_X_OFFSET,
      y + RANK_Y_OFFSET
    );
  }

  async _drawAvatar() {
    const avatar = await resourceGetter.getPlayerAvatar(this.user.id);
    const circleMask = await resourceGetter.getImage("circleMask");
    avatar.mask(circleMask, 0, 0);
    this.image.composite(avatar, 25, 25);
  }

  async _drawFlag() {
    const flag = await resourceGetter.getPlayerCountryFlag(this.user.country);
    this.image.composite(flag, 83, 308);
  }

  async _drawSessionInfo() {
    await this._drawCommands(
      this._print,
      ["ubuntuBBlack32"],
      [25, 450, `Session Duration: ${this.sessionDuration}`],
      [502, 450, `Date of Session: ${this.date}`]
    );
  }

  async _drawSessionFields() {
    await this._drawCommands(
      this._printOffset,
      ["ubuntuBBlue32"],
      [326, 100, "Global Rank:"],
      [300, 140, "Country Rank:"],
      [371, 180, "Accuracy:"],
      [466, 220, "PP:"],
      [341, 260, "Play Count:"]
    );

    await this._drawCommands(
      this._printOffset,
      // with black font at x-offset 522
      ["ubuntuBBlack32", 522],
      [100, this.globalRank],
      [140, this.countryRank],
      [180, this.accuracy],
      [220, this.pp],
      [260, this.plays]
    );

    await this._printCenteredX(
      "ubuntuBBlack32",
      505 + GENERAL_X_OFFSET,
      28 + GENERAL_Y_OFFSET,
      `osu! Report for: ${this.player.osuUsername}`
    );
  }

  async _drawDifferences() {
    const {
      difGlobalRank,
      difCountryRank,
      difAcc,
      difPP,
      difPlayCount,
    } = this.delta;

    await this._drawCommands(
      this._printDifferenceColor,
      [527],
      [100, this.globalRank, difGlobalRank],
      [140, this.countryRank, difCountryRank],
      [180, this.accuracy, difAcc],
      [220, this.pp, difPP],
      [260, this.plays, difPlayCount]
    );
  }

  async _drawLevels() {
    //level bar
    const levelBar = await resourceGetter.getImage("levelBar");

    const { difLevel } = this.delta;
    const fLevel = parseFloat(this.user.level);
    const fProgress = fLevel % 1;
    const percentage = Math.trunc(fProgress * 100).toString() + "%";
    const level = Math.trunc(fLevel).toString();

    if (fProgress > 0) {
      levelBar.resize(430 * fProgress, 6);
      this.image.composite(levelBar, 303, 309);
    }

    const hex = (await resourceGetter.getImage("hex")).clone();
    await this._printCentered(
      hex,
      "ubuntuBBlue24",
      hex.getWidth() / 2,
      hex.getHeight() / 2,
      level
    );

    const spacing = 5;
    const center = 312;
    return this._printCenteredY(
      "ubuntuBBlack24",
      734 + LEVEL_BAR_X_OFFSET,
      center,
      percentage
    )
      .then(({ x }) =>
        this._printCenteredY("ubuntuBGreen24", x + spacing, center, difLevel)
      )
      .then(({ x }) =>
        this.image.blit(hex, x + spacing, center - hex.getHeight() / 2)
      );
  }
}

class ReportGenerator {
  constructor() {
    let fontPromises = {
      ubuntuB_blue_32: resourceGetter.getFont("ubuntuBBlue32"),
      ubuntuB_black_32: resourceGetter.getFont("ubuntuBBlack32"),
      ubuntuB_red_32: resourceGetter.getFont("ubuntuBRed32"),
      ubuntuB_green_32: resourceGetter.getFont("ubuntuBGreen32"),
      ubuntuB_black_24: resourceGetter.getFont("ubuntuBBlack24"),
      ubuntuB_green_24: resourceGetter.getFont("ubuntuBGreen24"),
      ubuntuB_blue_24: resourceGetter.getFont("ubuntuBBlue24"),
      ubuntuB_lightblue_32: resourceGetter.getFont("ubuntuBLightBlue32"),
      ubuntuB_white_24: resourceGetter.getFont("ubuntuBWhite24"),
      ubuntuB_white_32: resourceGetter.getFont("ubuntuBWhite32"),
      ubuntuB_gold_52: resourceGetter.getFont("ubuntuBGold52"),
      ubuntuB_yellow_32: resourceGetter.getFont("ubuntuBYellow32"),
      ubuntuB_lightgreen_32: resourceGetter.getFont("ubuntuBLightGreen32"),
      ubuntuB_lightred_32: resourceGetter.getFont("ubuntuBLightRed32"),
    };

    this.fonts = Promise.all(_.values(fontPromises)).then((resources) =>
      _.zipObject(_.keys(fontPromises), resources)
    );
  }

  async generateReports(
    playObjects,
    player,
    user,
    sessionDuration,
    date,
    delta
  ) {
    let generated = new Report(
      await resourceGetter.getNewReportTemplate(),
      player,
      user,
      sessionDuration,
      date,
      delta
    );

    let baseReport = (await generated.generateBase()).clone();
    await generated.generate();
    let report = generated.image;

    var yMultiOffset;
    var imageToEdit;
    var reportImages = [];
    for (var i = 0; i < playObjects.length; i++) {
      if (i === 0) {
        globalInstances.logMessage("writing to 1");
        yMultiOffset = 0;
        imageToEdit = report;
      } else if (i === 10) {
        reportImages.push(imageToEdit);
        imageToEdit = baseReport.clone();
        globalInstances.logMessage("writing to 2");
        yMultiOffset += -2750;
      } else if (i === 20) {
        reportImages.push(imageToEdit);
        imageToEdit = baseReport.clone();
        globalInstances.logMessage("writing to 3");
        yMultiOffset += -2750;
      } else if (i === 30) {
        reportImages.push(imageToEdit);
        imageToEdit = baseReport.clone();
        globalInstances.logMessage("writing to 4");
        yMultiOffset += -2750;
      } else if (i >= 40) {
        globalInstances.logMessage("break;");
        break;
      }

      var heightOfGeneralInfo = 505;
      await PlayImage.create(playObjects[i]).then((im) =>
        imageToEdit.composite(im, 25, yMultiOffset + heightOfGeneralInfo)
      );
      yMultiOffset += 275;

      if (playObjects.length - 1 == i) {
        globalInstances.logMessage("need to crop because its the last play");
        if (i >= 10) {
          imageToEdit.crop(0, 485, 950, 775 + (i % 10) * 275 - 485);
        } else {
          imageToEdit.crop(0, 0, 950, 775 + (i % 10) * 275);
        }
      } else if ((i + 1) % 10 == 0) {
        globalInstances.logMessage("cropping because last play has been added");
        if (i >= 10) {
          imageToEdit.crop(0, 485, 950, 775 + 9 * 275 - 485);
        } else {
          imageToEdit.crop(0, 0, 950, 775 + 9 * 275);
        }
      }
    }
    reportImages.push(imageToEdit);

    return reportImages;
  }
}

module.exports = new ReportGenerator();
