declare global {
  namespace osuReports {
    interface Play {
      sessionId: number;
      osuUsername: string;
      date: string;
      bg: string;
      title: string;
      version: string;
      artist: string;
      combo: number;
      maxCombo: number;
      bpm: number;
      playDuration: string;
      difficulty: number;
      playAccuracy: number;
      rank: number;
      mods: string;
      counts300: number;
      counts100: number;
      counts50: number;
      countsMiss: number;
      playPP: number;
      numSpinners: number;
      numSliders: number;
      numCircles: number;
      numObjects: number;
      approachRate: number;
      healthPoints: number;
      overallDifficulty: number;
      circleSize: number;
    }
    interface Session {
      sessionID: Number;
      tweetID: String;
      date: String;
      osuUsername: String;
      sessionDuration: String;
      globalRank: Number;
      difGlobalRank: String;
      countryRank: Number;
      difCountryRank: String;
      level: Number;
      difLevel: String;
      accuracy: Number;
      difAcc: String;
      totalPP: Number;
      difPP: String;
      playCount: Number;
      difPlayCount: String;
      countSSPlus: Number;
      countSS: Number;
      countSPlus: Number;
      countS: Number;
      countA: Number;
      difSSPlus: String;
      difSS: String;
      difSPlus: String;
      difS: String;
      difA: String;
      osu?: {
        username: string;
        id: string;
      };
    }
  }
}

export default osuReports;
