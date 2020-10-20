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
declare class Match {
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
