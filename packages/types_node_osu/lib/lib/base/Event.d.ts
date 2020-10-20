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
declare class Event {
    constructor(config: any, data: any);
    html: any;
    beatmapId: any;
    beatmapsetId: any;
    raw_date: any;
    epicFactor: any;
    get date(): Date;
    _date: Date;
}
