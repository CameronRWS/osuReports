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
declare class Score {
    constructor(config: any, data: any, beatmap: any);
    score: any;
    user: {
        name: any;
        id: any;
    };
    beatmapId: any;
    counts: {
        '300': any;
        '100': any;
        '50': any;
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
