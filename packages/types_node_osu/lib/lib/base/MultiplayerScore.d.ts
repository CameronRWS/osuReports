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
declare class MultiplayerScore {
    constructor(config: any, data: any);
    slot: any;
    team: any;
    userId: any;
    score: any;
    maxCombo: any;
    rank: any;
    counts: {
        '300': any;
        '100': any;
        '50': any;
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
