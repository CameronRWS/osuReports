import resourceGetter from "@osureport/resources";
import { Cache as UserCache } from "../user";

import { secondsToDHMS } from "../timeUtils";

import {
  DrawTools,
  GENERAL_X_OFFSET,
  GENERAL_Y_OFFSET,
  LEVEL_BAR_X_OFFSET,
  LEVEL_BAR_Y_OFFSET,
  RANK_X_OFFSET,
  RANK_Y_OFFSET
} from "./drawTools";

class Report extends DrawTools {
  protected player;
  protected user;
  protected sessionDuration;
  protected date;
  protected delta;

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

  get rankedScore() {
    if (this.user.scores.ranked === null) {
      return "info unavailable";
    }
    return parseFloat(this.user.scores.ranked).toLocaleString("en");
  }

  get timePlayed() {
    if (this.user.secondsPlayed === null) {
      return "info unavailable";
    }
    const arrDHMS = secondsToDHMS(this.user.secondsPlayed);
    let s = "";
    if (arrDHMS[0] != 0) {
      s += `${arrDHMS[0]}d `;
    }
    if (arrDHMS[1] != 0) {
      s += `${arrDHMS[1]}h `;
    }
    if (arrDHMS[2] != 0) {
      s += `${arrDHMS[2]}m `;
    }
    return s.substring(0, s.length - 1);
  }

  async generate() {
    await this._drawRanks();
    await this._drawAvatar();
    await this._drawFlag();
    await this._drawSessionInfo();
    await this._drawSessionFields();
    await this._drawDifferences();
    await this._drawLevels();
    return this.image;
  }

  async _drawRanks() {
    await this._drawCommands(
      this._drawRank,
      [],
      ["rankSSPlus", 220, 305],
      ["rankSS", 340, 305],
      ["rankSPlus", 460, 305],
      ["rankS", 580, 305],
      ["rankA", 710, 305]
    );

    const { SSH, SS, SH, S, A } = this.user.counts;
    const { difSSPlus, difSS, difSPlus, difS, difA } = this.delta;

    await this._drawCommands(
      this._printRanks,
      [],
      [280, 363 + RANK_Y_OFFSET, SSH, difSSPlus || ""],
      [400, 363 + RANK_Y_OFFSET, SS, difSS || ""],
      [520, 363 + RANK_Y_OFFSET, SH, difSPlus || ""],
      [640, 363 + RANK_Y_OFFSET, S, difS || ""],
      [760, 363 + RANK_Y_OFFSET, A, difA || ""]
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
    const y = 460;
    await this._drawCommands(
      this._printOffset,
      ["ubuntuBBlue32"],
      [-30, y, "Session Duration:"],
      [450, y, "Date of Session:"]
    );

    await this._drawCommands(
      this._printOffset,
      // with black font at x-offset 522
      ["ubuntuBBlack32"],
      [247, y, this.sessionDuration],
      [708, y, this.date]
    );
  }

  async _drawSessionFields() {
    const start = 100;
    const every = 30;
    const x = 40;
    await this._drawCommands(
      this._printOffset,
      ["ubuntuBBlue24"],
      [326 + x, start + 0 * every, "Global Rank:"],
      [305 + x, start + 1 * every, "Country Rank:"],
      [361 + x, start + 2 * every, "Accuracy:"],
      [435 + x, start + 3 * every, "PP:"],
      [338 + x, start + 4 * every, "Play Count:"],
      [309 + x, start + 5 * every, "Ranked Score:"],
      [323 + x, start + 6 * every, "Time Played:"]
    );

    await this._drawCommands(
      this._printOffset,
      // with black font at x-offset 522
      ["ubuntuBBlack24", 480 + x],
      [start + 0 * every, this.globalRank],
      [start + 1 * every, this.countryRank],
      [start + 2 * every, this.accuracy],
      [start + 3 * every, this.pp],
      [start + 4 * every, this.plays],
      [start + 5 * every, this.rankedScore],
      [start + 6 * every, this.timePlayed]
    );
    let osuUsername = await UserCache.getOsuUser(this.player.osuUsername);
    await this._printCenteredX(
      "ubuntuBBlack32",
      505 + GENERAL_X_OFFSET,
      28 + GENERAL_Y_OFFSET,
      `osu! Report for: ${osuUsername}`
    );
  }

  async _drawDifferences() {
    const start = 100;
    const every = 30;
    const {
      difGlobalRank,
      difCountryRank,
      difAcc,
      difPP,
      difPlayCount,
      difRankedScore
    } = this.delta;

    await this._drawCommands(
      this._printDifferenceColor,
      [486 + 40],
      [start + 0 * every, this.globalRank, difGlobalRank],
      [start + 1 * every, this.countryRank, difCountryRank],
      [start + 2 * every, this.accuracy, difAcc],
      [start + 3 * every, this.pp, difPP],
      [start + 4 * every, this.plays, difPlayCount],
      [start + 5 * every, this.rankedScore, difRankedScore || ""]
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

export = Report;
