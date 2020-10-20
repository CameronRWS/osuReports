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
declare class Game {
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
