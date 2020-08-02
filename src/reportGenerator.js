/**
 * @typedef {import('jimp/types/ts3.1/index')} Jimp
 */

const resourceGetter = require("./resourceGetter");

const PlayImage = require("./playImage");
const Report = require("./report");

class ReportGenerator {
  async generateReports(
    playObjects,
    player,
    user,
    sessionDuration,
    date,
    delta
  ) {
    const baseReport = await resourceGetter.getNewReportTemplate();
    let generator = new Report(
      baseReport.clone(),
      player,
      user,
      sessionDuration,
      date,
      delta
    );

    let reportWithHeader = await generator.generate();

    const playsPerImage = 10;
    const maxImages = 4;
    const plays = await Promise.all(
      playObjects
        .slice(0, maxImages * playsPerImage)
        .map(play => PlayImage.create(play))
    );
    const playSets = new Array(Math.ceil(plays.length / playsPerImage))
      .fill(null)
      .map((_, n) => plays.slice(n * playsPerImage, (n + 1) * playsPerImage));

    const heightOfGeneralInfo = 485;
    const padding = { x: 25, y: 20, between: 25 };

    const reports = playSets.map((plays, ridx) => {
      const report = ridx > 0 ? baseReport.clone() : reportWithHeader;
      plays.forEach((play, idx) => {
        report.composite(
          play,
          padding.x,
          (play.getHeight() + padding.between) * idx +
            heightOfGeneralInfo +
            padding.y
        );
      });
      report.crop(
        0,
        +(ridx > 0) * heightOfGeneralInfo,
        report.getWidth(),
        heightOfGeneralInfo +
          padding.y +
          (plays[0].getHeight() + padding.between) * plays.length +
          -5 +
          -(ridx > 0) * heightOfGeneralInfo
      );
      return report;
    });

    return reports;
  }
}

module.exports = new ReportGenerator();
