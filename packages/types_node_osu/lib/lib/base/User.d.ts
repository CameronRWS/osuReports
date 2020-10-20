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
declare class User {
    constructor(config: any, data: any);
    id: any;
    name: any;
    counts: {
        '300': any;
        '100': any;
        '50': any;
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
