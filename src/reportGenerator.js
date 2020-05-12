/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 */

const _ = require('lodash');
const axios = require('axios');

const jimp = require('jimp');
const { promisify } = require('util');

const globalInstances = require('./globalInstances');
const resourceGetter = require('./resourceGetter');

const { secondsToDHMS } = require('./utils');
const {
  DrawTools,
  GENERAL_X_OFFSET,
  GENERAL_Y_OFFSET,
  LEVEL_BAR_X_OFFSET,
  LEVEL_BAR_Y_OFFSET,
  RANK_X_OFFSET,
  RANK_Y_OFFSET,
} = require('./drawTools');

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
    return '#' + parseFloat(this.user.pp.rank).toLocaleString('en');
  }

  get countryRank() {
    return '#' + parseFloat(this.user.pp.countryRank).toLocaleString('en');
  }

  get accuracy() {
    return parseFloat(this.user.accuracy).toFixed(2) + '%';
  }

  get pp() {
    return parseFloat(this.user.pp.raw).toLocaleString('en');
  }

  get plays() {
    return parseFloat(this.user.counts.plays).toLocaleString('en');
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
      ['rankSSPlus', 220, 305],
      ['rankSS', 340, 305],
      ['rankSPlus', 460, 305],
      ['rankS', 580, 305],
      ['rankA', 700, 305]
    );

    const { SSH, SS, SH, S, A } = this.user.counts;
    await this._drawCommands(
      this._printRanks,
      ['ubuntuBBlack24'],
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
    const circleMask = await resourceGetter.getImage('circleMask');
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
      ['ubuntuBBlack32'],
      [25, 450, `Session Duration: ${this.sessionDuration}`],
      [502, 450, `Date of Session: ${this.date}`]
    );
  }

  async _drawSessionFields() {
    await this._drawCommands(
      this._printOffset,
      ['ubuntuBBlue32'],
      [326, 100, 'Global Rank:'],
      [300, 140, 'Country Rank:'],
      [371, 180, 'Accuracy:'],
      [466, 220, 'PP:'],
      [341, 260, 'Play Count:']
    );

    await this._drawCommands(
      this._printOffset,
      // with black font at x-offset 522
      ['ubuntuBBlack32', 522],
      [100, this.globalRank],
      [140, this.countryRank],
      [180, this.accuracy],
      [220, this.pp],
      [260, this.plays]
    );

    await this._printCenteredX(
      'ubuntuBBlack32',
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
    const levelBar = await resourceGetter.getImage('levelBar');

    const { difLevel } = this.delta;
    const fLevel = parseFloat(this.user.level);
    const fProgress = fLevel % 1;
    const percentage = Math.trunc(fProgress * 100).toString() + '%';
    const level = Math.trunc(fLevel).toString();

    if (fProgress > 0) {
      levelBar.resize(430 * fProgress, 6);
      this.image.composite(levelBar, 303, 309);
    }

    const hex = (await resourceGetter.getImage('hex')).clone();
    await this._printCentered(
      hex,
      'ubuntuBBlue24',
      hex.getWidth() / 2,
      hex.getHeight() / 2,
      level
    );

    const spacing = 5;
    const center = 312;
    return this._printCenteredY(
      'ubuntuBBlack24',
      734 + LEVEL_BAR_X_OFFSET,
      center,
      percentage
    )
      .then(({ x }) =>
        this._printCenteredY('ubuntuBGreen24', x + spacing, center, difLevel)
      )
      .then(({ x }) =>
        this.image.blit(hex, x + spacing, center - hex.getHeight() / 2)
      );
  }
}

class ReportGenerator {
  constructor() {
    let fontPromises = {
      ubuntuB_blue_32: resourceGetter.getFont('ubuntuBBlue32'),
      ubuntuB_black_32: resourceGetter.getFont('ubuntuBBlack32'),
      ubuntuB_red_32: resourceGetter.getFont('ubuntuBRed32'),
      ubuntuB_green_32: resourceGetter.getFont('ubuntuBGreen32'),
      ubuntuB_black_24: resourceGetter.getFont('ubuntuBBlack24'),
      ubuntuB_green_24: resourceGetter.getFont('ubuntuBGreen24'),
      ubuntuB_blue_24: resourceGetter.getFont('ubuntuBBlue24'),
      ubuntuB_lightblue_32: resourceGetter.getFont('ubuntuBLightBlue32'),
      ubuntuB_white_24: resourceGetter.getFont('ubuntuBWhite24'),
      ubuntuB_white_32: resourceGetter.getFont('ubuntuBWhite32'),
      ubuntuB_gold_52: resourceGetter.getFont('ubuntuBGold52'),
      ubuntuB_yellow_32: resourceGetter.getFont('ubuntuBYellow32'),
      ubuntuB_lightgreen_32: resourceGetter.getFont('ubuntuBLightGreen32'),
      ubuntuB_lightred_32: resourceGetter.getFont('ubuntuBLightRed32'),
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

    return this.fonts.then(async (fonts) => {
      let backgroundPromises = playObjects.map((play) =>
        resourceGetter.getBackground(play.background)
      );
      let reportImages = await Promise.all(backgroundPromises).then(
        async function (backgrounds) {
          for (var i = 0; i < backgrounds.length; i++) {
            if (backgrounds[i].isDefault) {
              playObjects[i].artist = playObjects[i].artist + ' <default bg>';
            }
          }

          let reportImages = [];

          //plays
          let imageToEdit = null;
          for (var i = 0; i < playObjects.length; i++) {
            var yMultiOffset;

            if (i === 0) {
              globalInstances.logMessage('writing to 1');
              yMultiOffset = 0;
              imageToEdit = report;
            } else if (i === 10) {
              reportImages.push(imageToEdit);
              imageToEdit = baseReport.clone();
              globalInstances.logMessage('writing to 2');
              yMultiOffset = -2750;
            } else if (i === 20) {
              reportImages.push(imageToEdit);
              imageToEdit = baseReport.clone();
              globalInstances.logMessage('writing to 3');
              yMultiOffset = -2750 * 2;
            } else if (i === 30) {
              reportImages.push(imageToEdit);
              imageToEdit = baseReport.clone();
              globalInstances.logMessage('writing to 4');
              yMultiOffset = -2750 * 3;
            } else if (i >= 40) {
              globalInstances.logMessage('break;');
              break;
            }
            //console.log(data.length);
            //console.log(indexOfPlayImages + i);
            backgrounds[i].background.mask(
              await resourceGetter.getImage('playImageMask'),
              0,
              0
            );
            imageToEdit.composite(
              backgrounds[i].background.brightness(-0.5),
              25,
              505 + i * 275 + yMultiOffset
            );

            // playObjects[i].title = "Miniministop Hitoyasumi no Uta[Mokuyoubi]Gakusei no Uta"
            // playObjects[i].version = "xxxx xxx xx x "
            // playObjects[i].artist = "xxxx xxx xx x  xxxxx xxx xx xxxxx xx xxxxxx xxxxx xxx x xxx x xxxxx x xxxx"

            globalInstances.logMessage('| working on titles ');

            var tempTitle = playObjects[i].title;
            var tempVersion = playObjects[i].version;
            if (tempVersion.length > 20) {
              tempVersion = tempVersion.substring(0, 20) + '...';
            }
            //jimp.measureText(fonts.ubuntuB_lightblue_32, playObjects[i].title)
            //1320
            while (
              jimp.measureText(
                fonts.ubuntuB_lightblue_32,
                tempTitle + ' [' + tempVersion + ']'
              ) > 1000
            ) {
              tempTitle = tempTitle.substring(0, tempTitle.length - 1);
            }
            if (tempTitle != playObjects[i].title) {
              tempTitle = tempTitle + '...';
            }
            imageToEdit.print(
              fonts.ubuntuB_lightblue_32,
              30,
              505 + i * 275 + yMultiOffset,
              '' + tempTitle + ' [' + tempVersion + ']',
              680,
              (err, image, { x, y }) => {
                var tempArtist = playObjects[i].artist;
                while (
                  jimp.measureText(fonts.ubuntuB_white_24, tempArtist) > 600
                ) {
                  tempArtist = tempArtist.substring(0, tempArtist.length - 1);
                }
                if (tempArtist == playObjects[i].artist) {
                  image.print(
                    fonts.ubuntuB_white_24,
                    30,
                    y,
                    '  by ' + playObjects[i].artist,
                    1000
                  );
                } else {
                  image.print(
                    fonts.ubuntuB_white_24,
                    30,
                    y,
                    '  by ' + tempArtist + '...',
                    1000
                  );
                }
              }
            );

            globalInstances.logMessage('| working on rank ');
            //rank
            var playRankX = 800;
            var playRankY = 50;

            if (playObjects[i].rank == 'XH') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankSSPlus'),
                playRankX,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'X') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankSS'),
                playRankX,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'SH') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankSPlus'),
                playRankX,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'S') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankS'),
                playRankX,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'A') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankA'),
                playRankX + 10,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'B') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankB'),
                playRankX + 20,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'C') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankC'),
                playRankX + 20,
                505 + i * 275 + yMultiOffset + playRankY
              );
            } else if (playObjects[i].rank == 'D') {
              imageToEdit.composite(
                await resourceGetter.getImage('rankD'),
                playRankX + 20,
                505 + i * 275 + yMultiOffset + playRankY
              );
            }

            if (playObjects[i].accuracy == '100.00') {
              imageToEdit.print(
                fonts.ubuntuB_gold_52,
                583 + 120,
                505 + i * 275 + yMultiOffset - 7,
                playObjects[i].accuracy + '%'
              );
            } else {
              imageToEdit.print(
                fonts.ubuntuB_gold_52,
                610 + 120,
                505 + i * 275 + yMultiOffset - 7,
                playObjects[i].accuracy + '%'
              );
            }

            globalInstances.logMessage('| working on difficulty ');
            //difficulty
            var playStarY = 210;
            var playStarX = 195;
            var countOfStars = Math.ceil(parseFloat(playObjects[i].stars)) - 1;
            var partialStar = (parseFloat(playObjects[i].stars) % 1).toFixed(2);
            if (partialStar == 0.0) {
              countOfStars += 1;
            }
            var posOfPartialStar;
            for (var j = 1; j <= countOfStars; j++) {
              posOfPartialStar = playStarX + (j - 1) * 40;
              imageToEdit.composite(
                await resourceGetter.getImage('onlineStar', 0),
                playStarX + (j - 1) * 40,
                505 + i * 275 + yMultiOffset + playStarY
              );
            }
            if (partialStar == 0.0) {
              posOfPartialStar = posOfPartialStar - 40;
            } else if (partialStar < 0.3) {
              imageToEdit.composite(
                await resourceGetter.getImage('onlineStar', 3),
                playStarX + posOfPartialStar - 144,
                505 + i * 275 + yMultiOffset + playStarY + 10
              );
            } else if (partialStar < 0.6) {
              imageToEdit.composite(
                await resourceGetter.getImage('onlineStar', 2),
                playStarX + posOfPartialStar - 146,
                505 + i * 275 + yMultiOffset + playStarY + 7
              );
            } else if (partialStar < 1) {
              imageToEdit.composite(
                await resourceGetter.getImage('onlineStar', 1),
                playStarX + posOfPartialStar - 152,
                505 + i * 275 + yMultiOffset + playStarY + 4
              );
            }
            imageToEdit.print(
              fonts.ubuntuB_lightblue_32,
              30,
              505 + i * 275 + yMultiOffset + playStarY,
              'Difficulty: '
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              180 + posOfPartialStar - 100,
              505 + i * 275 + yMultiOffset + playStarY,
              '(' + playObjects[i].stars + ')'
            );

            globalInstances.logMessage('| working on duration ');
            //duration:
            var songDurationTotalSeconds = parseInt(playObjects[i].duration);
            const [
              _,
              songDurationHours,
              songDurationMinutes,
              songDurationSeconds,
            ] = secondsToDHMS(songDurationTotalSeconds);
            var songDuration = globalInstances.convertTimeToHMS(
              songDurationHours,
              songDurationMinutes,
              songDurationSeconds
            );
            var durationX = 41;
            var durationY = 175;
            imageToEdit.print(
              fonts.ubuntuB_lightblue_32,
              durationX,
              505 + i * 275 + yMultiOffset + durationY,
              'Duration: '
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              durationX + 150,
              505 + i * 275 + yMultiOffset + durationY,
              songDuration
            );

            globalInstances.logMessage('| working on bpm ');

            //bpm
            var bpmX = 75;
            var bpmY = 140;
            imageToEdit.print(
              fonts.ubuntuB_lightblue_32,
              30 + bpmX,
              505 + i * 275 + yMultiOffset + bpmY,
              'BPM: '
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              190,
              505 + i * 275 + yMultiOffset + bpmY,
              playObjects[i].bpm
            );

            globalInstances.logMessage('| working on pp ');
            //pp
            imageToEdit.print(
              fonts.ubuntuB_gold_52,
              800 -
                jimp.measureText(
                  fonts.ubuntuB_gold_52,
                  Math.ceil(playObjects[i].pp) + 'pp'
                ) +
                107,
              505 + i * 275 + yMultiOffset + 185,
              Math.ceil(playObjects[i].pp) + 'pp'
            );

            globalInstances.logMessage('| working on mods ');

            //mods
            var modY = 120;
            var posOfMod = 870;
            if (playObjects[i].mods.includes('DT')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modDoubleTime'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('NC')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modNightcore'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('PF')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modPerfect'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('HD')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modHidden'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('SD')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modSuddenDeath'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('FL')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modFlashlight'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('HR')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modHardRock'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('NF')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modNoFail'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }
            if (playObjects[i].mods.includes('EZ')) {
              imageToEdit.composite(
                await resourceGetter.getImage('modEasy'),
                posOfMod,
                505 + i * 275 + yMultiOffset + modY
              );
              posOfMod = posOfMod - 47;
            }

            globalInstances.logMessage('| working on combo ');

            //play combo
            imageToEdit.print(
              fonts.ubuntuB_lightblue_32,
              72,
              505 + i * 275 + yMultiOffset + 105,
              'Combo: '
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              190,
              505 + i * 275 + yMultiOffset + 105,
              playObjects[i].combo + ' / ' + playObjects[i].maxCombo
            );

            globalInstances.logMessage('| working on counts ');

            //play counts
            var countY = 155;

            var measurement = jimp.measureText(
              fonts.ubuntuB_lightblue_32,
              playObjects[i].countsObject.count_300 +
                ' / ' +
                playObjects[i].countsObject.count_100 +
                ' / ' +
                playObjects[i].countsObject.count_50 +
                ' / ' +
                playObjects[i].countsObject.count_miss
            );
            imageToEdit.print(
              fonts.ubuntuB_lightblue_32,
              915 - measurement,
              505 + i * 275 + yMultiOffset + countY,
              playObjects[i].countsObject.count_300
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              915 -
                measurement +
                jimp.measureText(
                  fonts.ubuntuB_lightblue_32,
                  playObjects[i].countsObject.count_300 + ''
                ),
              505 + i * 275 + yMultiOffset + countY,
              ' / '
            );
            imageToEdit.print(
              fonts.ubuntuB_lightgreen_32,
              915 -
                measurement +
                jimp.measureText(
                  fonts.ubuntuB_lightblue_32,
                  playObjects[i].countsObject.count_300 + ' / '
                ),
              505 + i * 275 + yMultiOffset + countY,
              playObjects[i].countsObject.count_100
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              915 -
                measurement +
                jimp.measureText(
                  fonts.ubuntuB_lightblue_32,
                  playObjects[i].countsObject.count_300 +
                    ' / ' +
                    playObjects[i].countsObject.count_100
                ),
              505 + i * 275 + yMultiOffset + countY,
              ' / '
            );
            imageToEdit.print(
              fonts.ubuntuB_yellow_32,
              915 -
                measurement +
                jimp.measureText(
                  fonts.ubuntuB_lightblue_32,
                  playObjects[i].countsObject.count_300 +
                    ' / ' +
                    playObjects[i].countsObject.count_100 +
                    ' / '
                ),
              505 + i * 275 + yMultiOffset + countY,
              playObjects[i].countsObject.count_50
            );
            imageToEdit.print(
              fonts.ubuntuB_white_32,
              915 -
                measurement +
                jimp.measureText(
                  fonts.ubuntuB_lightblue_32,
                  playObjects[i].countsObject.count_300 +
                    ' / ' +
                    playObjects[i].countsObject.count_100 +
                    ' / ' +
                    playObjects[i].countsObject.count_50
                ),
              505 + i * 275 + yMultiOffset + countY,
              ' / '
            );
            imageToEdit.print(
              fonts.ubuntuB_lightred_32,
              915 -
                measurement +
                jimp.measureText(
                  fonts.ubuntuB_lightblue_32,
                  playObjects[i].countsObject.count_300 +
                    ' / ' +
                    playObjects[i].countsObject.count_100 +
                    ' / ' +
                    playObjects[i].countsObject.count_50 +
                    ' / '
                ),
              505 + i * 275 + yMultiOffset + countY,
              playObjects[i].countsObject.count_miss
            );

            if (playObjects.length - 1 == i) {
              globalInstances.logMessage(
                'need to crop because its the last play'
              );
              if (i >= 10) {
                imageToEdit.crop(0, 485, 950, 775 + (i % 10) * 275 - 485);
              } else {
                imageToEdit.crop(0, 0, 950, 775 + (i % 10) * 275);
              }
            } else if ((i + 1) % 10 == 0) {
              globalInstances.logMessage(
                'cropping because last play has been added'
              );
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
      );
      return reportImages;
    });
  }
}

module.exports = new ReportGenerator();
