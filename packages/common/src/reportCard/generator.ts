import resourceGetter from "@osureport/resources";
import db from "../instances/db";
import osuApi from "../instances/osuApi";
import { ReportImage } from "../report";

class Generator {
  async generateReportCard(sessionId) {
    const session = await db.getSession(sessionId);
    if (session === undefined) {
      return null;
    }
    const baseReport = await resourceGetter.getNewReportTemplate();
    const baseReportCard = await baseReport.crop(0, 0, 950, 498);
    const player = { osuUsername: session.osuUsername };
    const user = {
      pp: {
        rank: session.globalRank,
        countryRank: session.countryRank,
        raw: session.totalPP
      },
      accuracy: session.accuracy,
      counts: {
        plays: session.playCount,
        SSH: session.countSSPlus,
        SS: session.countSS,
        SH: session.countSPlus,
        S: session.countS,
        A: session.countA
      },
      country: await this.getCountry(session.osuUsername),
      level: session.level,
      id: session.osuUsername,
      scores: {
        ranked: session.rankedScore
      },
      secondsPlayed: session.secondsPlayed
    };

    const delta = {
      difGlobalRank: session.difGlobalRank,
      difCountryRank: session.difCountryRank,
      difAcc: session.difAcc,
      difPP: session.difPP,
      difPlayCount: session.difPlayCount,
      difLevel: session.difLevel,
      difSSPlus: session.difSSPlus,
      difSS: session.difSS,
      difSPlus: session.difSPlus,
      difS: session.difS,
      difA: session.difA,
      difRankedScore: session.difRankedScore
    };

    let generator = new ReportImage(
      baseReportCard.clone(),
      player,
      user,
      session.sessionDuration,
      this.dateFormat(session.date),
      delta
    );
    const reportCard = await generator.generate();
    return reportCard;
  }
  async getCountry(osuUsername) {
    let user = await osuApi.getUser({
      u: osuUsername
    });
    return user.country;
  }
  dateFormat(passedDate) {
    let date;
    //this is because some are in UTC some are epoch
    if (passedDate.toString().includes("Z")) {
      date = new Date(passedDate);
    } else {
      date = new Date(+passedDate);
    }
    return date.toLocaleDateString("US-en");
  }
}

export = new Generator();
