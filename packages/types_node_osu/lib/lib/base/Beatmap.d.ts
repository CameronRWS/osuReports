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
declare class Beatmap {
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
