declare module "node-osu" {
  export const Api: typeof import("node-osu/lib/Api");
  export const Constants: {
    readonly Mods: {
      None: number;
      NoFail: number;
      Easy: number;
      TouchDevice: number;
      Hidden: number;
      HardRock: number;
      SuddenDeath: number;
      DoubleTime: number;
      Relax: number;
      HalfTime: number;
      Nightcore: number;
      Flashlight: number;
      Autoplay: number;
      SpunOut: number;
      Relax2: number;
      Perfect: number;
      Key4: number;
      Key5: number;
      Key6: number;
      Key7: number;
      Key8: number;
      FadeIn: number;
      Random: number;
      Cinema: number;
      Target: number;
      Key9: number;
      KeyCoop: number;
      Key1: number;
      Key3: number;
      Key2: number;
      KeyMod: number;
      FreeModAllowed: number;
      ScoreIncreaseMods: number;
    };
    URLSchemas: {
      multiplayerMatch: (id: any, password: any) => string;
      edit: (position: any, objects: any) => string;
      channel: (name: any) => string;
      download: (id: any) => string;
      spectate: (user: any) => string;
    };
    Beatmaps: {
      readonly approved: {
        "-2": string;
        "-1": string;
        "0": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
      };
      readonly genre: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        "6": string;
        "7": string;
        "9": string;
        "10": string;
      };
      readonly language: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        "6": string;
        "7": string;
        "8": string;
        "9": string;
        "10": string;
        "11": string;
      };
      readonly mode: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
      };
    };
    Multiplayer: {
      readonly scoringType: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
      };
      readonly teamType: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
      };
      readonly team: {
        "0": string;
        "1": string;
        "2": string;
      };
    };
    AccuracyMethods: {
      Standard: (c: any) => number;
      Taiko: (c: any) => number;
      "Catch the Beat": (c: any) => number;
      Mania: (c: any) => number;
    };
  };
  export const Beatmap: typeof import("node-osu/lib/base/Beatmap");
  export const Score: typeof import("node-osu/lib/base/Score");
  export const User: typeof import("node-osu/lib/base/User");
  export const Match: typeof import("node-osu/lib/base/Match");
  export const Game: typeof import("node-osu/lib/base/Game");
  export const MultiplayerScore: typeof import("node-osu/lib/base/MultiplayerScore");
  export const Event: typeof import("node-osu/lib/base/Event");
}
declare module "node-osu/lib/Api" {
  export = Api;
  class Api {
    /**
     * Creates a new node-osu object
     * @param {String} apiKey your osu api key
     * @param {Object} [options]
     * @param {String} [options.baseUrl="https://osu.ppy.sh/api"] Sets the base api url
     * @param {Boolean} [options.notFoundAsError=true] Throw an error on not found instead of returning nothing
     * @param {Boolean} [options.completeScores=false] When fetching scores also fetch the beatmap they are for (Allows getting accuracy)
     * @param {Boolean} [options.parseNumeric=false] Parse numeric properties into numbers. May have overflow
     */
    constructor(
      apiKey: string,
      options?: Partial<{
        baseUrl: string;
        notFoundAsError: boolean;
        completeScores: boolean;
        parseNumeric: boolean;
      }>
    );
    apiKey: string;
    baseUrl: string;
    notFoundAsError: boolean;
    completeScores: boolean;
    parseNumeric: boolean;
    get config(): {
      notFoundAsError: boolean;
      completeScores: boolean;
      parseNumeric: boolean;
    };
    /**
     * Makes an api call
     * @param {String} endpoint
     * @param {Object} options
     * @param {Date} [options.since] Return all beatmaps ranked or loved since this date
     * @param {String} [options.s] Specify a beatmapSetId to return metadata from
     * @param {String} [options.b] Specify a beatmapId to return metadata from
     * @param {String} [options.u] Specify a userId or a username to return metadata from
     * @param {"string"|"id"} [options.type] Specify if `u` is a userId or a username
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {0|1} [options.a] Specify whether converted beatmaps are included
     * @param {String} [options.h] The beatmap hash
     * @param {Number} [options.limit] Amount of results. Default and maximum are 500
     * @param {Number} [options.mods] Mods that apply to the beatmap requested. Default is 0
     * @param {Number} [options.event_days] Max number of days between now and last event date. Range of 1-31. Default value is 1
     * @param {String} [options.mp] Match id to get information from
     * @returns {Promise<Object>} The response body
     */
    apiCall(
      endpoint: string,
      options: {
        since: Date;
        s: string;
        b: string;
        u: string;
        type: "string" | "id";
        m: 0 | 1 | 2 | 3;
        a: 0 | 1;
        h: string;
        limit: number;
        mods: number;
        event_days: number;
        mp: string;
      }
    ): Promise<any>;
    /**
     * Returns a not found error or the response, depending on the config
     * @param {Object} response
     * @returns {Object}
     */
    notFound(response: any): any;
    /**
     * Returns an array of Beatmap objects
     * @param {Object} options
     * @param {String} options.b Specify a beatmapId to return metadata from
     * @param {Date} [options.since] Return all beatmaps ranked or loved since this date
     * @param {String} [options.s] Specify a beatmapSetId to return metadata from
     * @param {String} [options.u] Specify a userId or a username to return metadata from
     * @param {"string"|"id"} [options.type] Specify if `u` is a userId or a username
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {0|1} [options.a] Specify whether converted beatmaps are included
     * @param {String} [options.h] The beatmap hash
     * @param {Number} [options.limit] Amount of results. Default and maximum are 500
     * @param {Number} [options.mods] Mods that apply to the beatmap requested. Default is 0
     * @returns {Promise<Beatmap[]>}
     */
    getBeatmaps(
      options: Partial<{
        b: string;
        since: Date;
        s: string;
        u: string;
        type: "string" | "id";
        m: 0 | 1 | 2 | 3;
        a: 0 | 1;
        h: string;
        limit: number;
        mods: number;
      }>
    ): Promise<import("node-osu/lib/base/Beatmap")[]>;
    /**
     * Returns a User object
     * @param {Object} options
     * @param {String} options.u Specify a userId or a username to return metadata from
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
     * @param {Number} [options.event_days] Max number of days between now and last event date. Range of 1-31. Default value is 1
     * @returns {Promise<User>}
     */
    getUser(
      options: Partial<{
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        event_days: number;
      }>
    ): Promise<import("node-osu/lib/base/User")>;
    /**
     * Returns an array of Score objects
     * @param {Object} options
     * @param {String} options.b Specify a beatmapId to return score information from
     * @param {String} [options.u] Specify a userId or a username to return information for
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
     * @param {Number} [options.limit] Amount of results from the top (range between 1 and 100 - defaults to 50)
     * @returns {Promise<Score[]>}
     */
    getScores(
      options: Partial<{
        b: string;
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        limit: number;
      }>
    ): Promise<import("node-osu/lib/base/Score")[]>;
    /**
     * Returns an array of Score objects
     * @param {Object} options
     * @param {String} options.u Specify a userId or a username to return best scores from
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
     * @param {Number} [options.limit] Amount of results (range between 1 and 100 - defaults to 10)
     * @returns {Promise<Score[]>}
     */
    getUserBest(
      options: Partial<{
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        limit: number;
      }>
    ): Promise<import("node-osu/lib/base/Score")[]>;
    /**
     * Returns an array of Score objects.
     * Will return not found if the user has not submitted any scores in the past 24 hours
     * @param {Object} options
     * @param {String} options.u Specify a userId or a username to return recent plays from
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {"string"|"id"} [options.type] Specify if `u` is a user_id or a username
     * @param {Number} [options.limit] Amount of results (range between 1 and 50 - defaults to 10)
     * @returns {Promise<Score[]>}
     */
    getUserRecent(
      options: Partial<{
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        limit: number;
      }>
    ): Promise<import("node-osu/lib/base/Score")[]>;
    /**
     * Returns a Match object.
     * @param {Object} options
     * @param {String} options.mp Match id to get information from
     * @returns {Promise<Match>}
     */
    getMatch(options: {
      mp: string;
    }): Promise<import("node-osu/lib/base/Match")>;
    /**
     * Returns a replay object. **Do not spam this endpoint.**
     * @param {Object} options
     * @param {0|1|2|3} options.m Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {String} options.b The beatmapId in which the replay was played
     * @param {String} options.u The user that has played the beatmap (required)
     * @param {"string"|"id"} [options.type] Specify if u is a userId or a username
     * @param {Number} [options.mods] Specify a mod or mod combination
     *
     */
    getReplay(
      options: Partial<{
        m: 0 | 1 | 2 | 3;
        b: string;
        u: string;
        type: "string" | "id";
        mods: number;
      }>
    ): Promise<any>;
  }
}
declare module "node-osu/lib/base/Beatmap" {
  export = Beatmap;
  /**
   * A beatmap
   * @prop {String} id
   * @prop {String} beatmapSetId
   * @prop {String} hash
   * @prop {String} title
   * @prop {String} creator
   * @prop {String} version
   * @prop {String} source
   * @prop {String} artist
   * @prop {String} genre
   * @prop {String} language
   * @prop {String|Number} rating
   * @prop {String|Number} bpm
   * @prop {String} mode
   * @prop {String[]} tags
   * @prop {String} approvalStatus
   * @prop {String} raw_submitDate
   * @prop {String} raw_approvedDate
   * @prop {String} raw_lastUpdate
   * @prop {String|Number} maxCombo
   * @prop {Object} objects
   * @prop {String|Number} objects.normal
   * @prop {String|Number} objects.slider
   * @prop {String|Number} objects.spinner
   * @prop {Object} difficulty
   * @prop {String|Number} difficulty.rating
   * @prop {String|Number} difficulty.aim
   * @prop {String|Number} difficulty.speed
   * @prop {String|Number} difficulty.size
   * @prop {String|Number} difficulty.overall
   * @prop {String|Number} difficulty.approach
   * @prop {String|Number} difficulty.drain
   * @prop {Object} length
   * @prop {String|Number} length.total
   * @prop {String|Number} length.drain
   * @prop {Object} counts
   * @prop {String|Number} counts.favorites
   * @prop {String|Number} counts.favourites
   * @prop {String|Number} counts.plays
   * @prop {String|Number} counts.passes
   * @prop {Boolean} hasDownload
   * @prop {Boolean} hasAudio
   * @prop {Date} submitDate
   * @prop {Date} approvedDate
   * @prop {Date} lastUpdate
   */
  class Beatmap {
    constructor(config: any, data: any);
    id: any;
    beatmapSetId: any;
    hash: any;
    title: any;
    creator: any;
    version: any;
    source: any;
    artist: any;
    genre: any;
    language: any;
    rating: any;
    bpm: any;
    mode: any;
    tags: any;
    approvalStatus: any;
    raw_submitDate: any;
    raw_approvedDate: any;
    raw_lastUpdate: any;
    maxCombo: any;
    objects: {
      normal: any;
      slider: any;
      spinner: any;
    };
    difficulty: {
      rating: any;
      aim: any;
      speed: any;
      size: any;
      overall: any;
      approach: any;
      drain: any;
    };
    length: {
      total: any;
      drain: any;
    };
    counts: {
      favorites: any;
      favourites: any;
      plays: any;
      passes: any;
    };
    hasDownload: boolean;
    hasAudio: boolean;
    get submitDate(): Date;
    _submitDate: Date;
    get approvedDate(): Date;
    _approvedDate: Date;
    get lastUpdate(): Date;
    _lastUpdate: Date;
  }
}
declare module "node-osu/lib/base/Event" {
  export = Event;
  /**
   * A timeline event for a user
   * @prop {String} html
   * @prop {String} beatmapId
   * @prop {String} beatmapSetId
   * @prop {String} raw_date
   * @prop {String|Number} epicFactor How "epic" this event is (from 1-32)
   * @prop {Date} date
   */
  class Event {
    constructor(config: any, data: any);
    html: any;
    beatmapId: any;
    beatmapsetId: any;
    raw_date: any;
    epicFactor: any;
    get date(): Date;
    _date: Date;
  }
}
declare module "node-osu/lib/base/Game" {
  export = Game;
  /**
   * A multiplayer game
   * @prop {String} id
   * @prop {String} raw_start
   * @prop {String} raw_end
   * @prop {String} beatmapId
   * @prop {String} mode
   * @prop {"0"} matchType
   * @prop {String} scoringType
   * @prop {String} teamType
   * @prop {Number} raw_mods
   * @prop {MultiplayerScore[]} scores
   * @prop {Date} start
   * @prop {Date} end
   * @prop {String[]} mods
   */
  class Game {
    constructor(config: any, data: any);
    id: any;
    raw_start: any;
    raw_end: any;
    beatmapId: any;
    mode: any;
    matchType: any;
    scoringType: any;
    teamType: any;
    raw_mods: number;
    scores: any;
    get start(): Date;
    _start: Date;
    get end(): Date;
    _end: Date;
    get mods(): any[];
    _mods: any[];
  }
}
declare module "node-osu/lib/base/Match" {
  export = Match;
  /**
   * A multiplayer match
   * @prop {String} id
   * @prop {String} name
   * @prop {String} raw_start
   * @prop {?String} raw_end null if not finished
   * @prop {Game[]} games
   * @prop {Date} start
   * @prop {Date} end
   */
  class Match {
    constructor(config: any, data: any);
    id: any;
    name: any;
    raw_start: any;
    raw_end: any;
    games: any;
    get start(): Date;
    _start: Date;
    get end(): Date;
    _end: Date;
  }
}
declare module "node-osu/lib/base/MultiplayerScore" {
  export = MultiplayerScore;
  /**
   * A multiplayer game score
   * @prop {String|Number} slot
   * @prop {String} team
   * @prop {String} userId
   * @prop {String|Number} score
   * @prop {String|Number} maxCombo
   * @prop {Null} rank
   * @prop {Object} counts
   * @prop {String|Number} counts.300
   * @prop {String|Number} counts.100
   * @prop {String|Number} counts.50
   * @prop {String|Number} counts.geki
   * @prop {String|Number} counts.katu
   * @prop {String|Number} counts.miss
   * @prop {Boolean} perfect
   * @prop {Boolean} pass
   * @prop {Number} raw_mods
   * @prop {String[]} mods
   */
  class MultiplayerScore {
    constructor(config: any, data: any);
    slot: any;
    team: any;
    userId: any;
    score: any;
    maxCombo: any;
    rank: any;
    counts: {
      "300": any;
      "100": any;
      "50": any;
      geki: any;
      katu: any;
      miss: any;
    };
    perfect: boolean;
    pass: boolean;
    raw_mods: number;
    get mods(): any[];
    _mods: any[];
  }
}
declare module "node-osu/lib/base/Score" {
  export = Score;
  /**
   * A score for a beatmap
   * @prop {String|Number} score
   * @prop {Object} user
   * @prop {?String} user.name Username of the player. Will be null if using a getUserX method
   * @prop {String} user.id
   * @prop {?String} beatmapId
   * @prop {Object} counts
   * @prop {String|Number} counts.300
   * @prop {String|Number} counts.100
   * @prop {String|Number} counts.50
   * @prop {String|Number} counts.geki
   * @prop {String|Number} counts.katu
   * @prop {String|Number} counts.miss
   * @prop {String|Number} maxCombo
   * @prop {Boolean} perfect
   * @prop {String} raw_date
   * @prop {String} rank
   * @prop {?String|?Number} pp
   * @prop {Boolean} hasReplay
   * @prop {Number} raw_mods bitwise representation of mods used
   * @prop {?Beatmap} beatmap
   * @prop {Date} date
   * @prop {String[]} mods
   * @prop {Number|undefined} accuracy The score's accuracy, if beatmap is defined, otherwise undefined
   */
  class Score {
    constructor(config: any, data: any, beatmap: any);
    score: any;
    user: {
      name: any;
      id: any;
    };
    beatmapId: any;
    counts: {
      "300": any;
      "100": any;
      "50": any;
      geki: any;
      katu: any;
      miss: any;
    };
    maxCombo: any;
    perfect: boolean;
    raw_date: any;
    rank: any;
    pp: any;
    hasReplay: boolean;
    raw_mods: number;
    _beatmap: any;
    set beatmap(arg: any);
    get beatmap(): any;
    get date(): Date;
    _date: Date;
    get mods(): any[];
    _mods: any[];
    get accuracy(): any;
    _accuracy: any;
  }
}
declare module "node-osu/lib/base/User" {
  export = User;
  /**
   * A user
   * @prop {String} id
   * @prop {String} name
   * @prop {Object} counts
   * @prop {String|Number} counts.300
   * @prop {String|Number} counts.100
   * @prop {String|Number} counts.50
   * @prop {String|Number} counts.SSH
   * @prop {String|Number} counts.SS
   * @prop {String|Number} counts.SH
   * @prop {String|Number} counts.S
   * @prop {String|Number} counts.A
   * @prop {String|Number} counts.plays
   * @prop {Object} scores
   * @prop {String|Number} scores.ranked
   * @prop {String|Number} scores.total
   * @prop {Object} pp
   * @prop {String|Number} pp.raw
   * @prop {String|Number} pp.rank
   * @prop {String|Number} pp.countryRank
   * @prop {String} country
   * @prop {String|Number} level
   * @prop {String|Number} accuracy
   * @prop {String|Number} secondsPlayed
   * @prop {String} raw_joinDate
   * @prop {Event[]} events
   * @prop {String} accuracyFormatted
   * @prop {Date} joinDate
   */
  class User {
    constructor(config: any, data: any);
    id: any;
    name: any;
    counts: {
      "300": any;
      "100": any;
      "50": any;
      SSH: any;
      SS: any;
      SH: any;
      S: any;
      A: any;
      plays: any;
    };
    scores: {
      ranked: any;
      total: any;
    };
    pp: {
      raw: any;
      rank: any;
      countryRank: any;
    };
    country: any;
    level: any;
    accuracy: any;
    secondsPlayed: any;
    raw_joinDate: any;
    events: any;
    get joinDate(): Date;
    _joinDate: Date;
    get accuracyFormatted(): string;
  }
}
declare module "node-osu/lib/Constants" {
  export namespace Mods {
    const None: number;
    const NoFail: number;
    const Easy: number;
    const TouchDevice: number;
    const Hidden: number;
    const HardRock: number;
    const SuddenDeath: number;
    const DoubleTime: number;
    const Relax: number;
    const HalfTime: number;
    const Nightcore: number;
    const Flashlight: number;
    const Autoplay: number;
    const SpunOut: number;
    const Relax2: number;
    const Perfect: number;
    const Key4: number;
    const Key5: number;
    const Key6: number;
    const Key7: number;
    const Key8: number;
    const FadeIn: number;
    const Random: number;
    const Cinema: number;
    const Target: number;
    const Key9: number;
    const KeyCoop: number;
    const Key1: number;
    const Key3: number;
    const Key2: number;
    const KeyMod: number;
    const FreeModAllowed: number;
    const ScoreIncreaseMods: number;
  }
  export namespace URLSchemas {
    function multiplayerMatch(id: any, password: any): string;
    function edit(position: any, objects: any): string;
    function channel(name: any): string;
    function download(id: any): string;
    function spectate(user: any): string;
  }
  export namespace Beatmaps {
    const approved: {
      "-2": string;
      "-1": string;
      "0": string;
      "1": string;
      "2": string;
      "3": string;
      "4": string;
    };
    const genre: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
      "4": string;
      "5": string;
      "6": string;
      "7": string;
      "9": string;
      "10": string;
    };
    const language: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
      "4": string;
      "5": string;
      "6": string;
      "7": string;
      "8": string;
      "9": string;
      "10": string;
      "11": string;
    };
    const mode: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
    };
  }
  export namespace Multiplayer {
    const scoringType: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
    };
    const teamType: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
    };
    const team: {
      "0": string;
      "1": string;
      "2": string;
    };
  }
  export const AccuracyMethods: {
    /**
     * Calculates accuracy based on hit counts for standard games
     * @param {Object} c Hit counts
     */
    Standard: (c: any) => number;
    /**
     * Calculates accuracy based on hit counts for taiko games
     * @param {Object} c Hit counts
     */
    Taiko: (c: any) => number;
    /**
     * Calculates accuracy based on hit counts for CtB games
     * @param {Object} c Hit counts
     */
    "Catch the Beat": (c: any) => number;
    /**
     * Calculates accuracy based on hit counts for mania games
     * @param {Object} c Hit counts
     */
    Mania: (c: any) => number;
  };
}
declare module "node-osu/lib/utils" {
  export function getNumeric(parseNumeric: any): (v: any) => any;
  export function getNumeric(parseNumeric: any): (v: any) => any;
}
