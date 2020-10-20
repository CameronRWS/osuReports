export = Api;
declare class Api {
    /**
     * Creates a new node-osu object
     * @param {String} apiKey your osu api key
     * @param {Object} [options]
     * @param {String} [options.baseUrl="https://osu.ppy.sh/api"] Sets the base api url
     * @param {Boolean} [options.notFoundAsError=true] Throw an error on not found instead of returning nothing
     * @param {Boolean} [options.completeScores=false] When fetching scores also fetch the beatmap they are for (Allows getting accuracy)
     * @param {Boolean} [options.parseNumeric=false] Parse numeric properties into numbers. May have overflow
     */
    constructor(apiKey: string, options?: {
        baseUrl: string;
        notFoundAsError: boolean;
        completeScores: boolean;
        parseNumeric: boolean;
    });
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
    apiCall(endpoint: string, options: {
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
    }): Promise<any>;
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
    getBeatmaps(options: {
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
    }): Promise<Beatmap[]>;
    /**
     * Returns a User object
     * @param {Object} options
     * @param {String} options.u Specify a userId or a username to return metadata from
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
     * @param {Number} [options.event_days] Max number of days between now and last event date. Range of 1-31. Default value is 1
     * @returns {Promise<User>}
     */
    getUser(options: {
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        event_days: number;
    }): Promise<User>;
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
    getScores(options: {
        b: string;
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        limit: number;
    }): Promise<Score[]>;
    /**
     * Returns an array of Score objects
     * @param {Object} options
     * @param {String} options.u Specify a userId or a username to return best scores from
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
     * @param {Number} [options.limit] Amount of results (range between 1 and 100 - defaults to 10)
     * @returns {Promise<Score[]>}
     */
    getUserBest(options: {
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        limit: number;
    }): Promise<Score[]>;
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
    getUserRecent(options: {
        u: string;
        m: 0 | 1 | 2 | 3;
        type: "string" | "id";
        limit: number;
    }): Promise<Score[]>;
    /**
     * Returns a Match object.
     * @param {Object} options
     * @param {String} options.mp Match id to get information from
     * @returns {Promise<Match>}
     */
    getMatch(options: {
        mp: string;
    }): Promise<Match>;
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
    getReplay(options: {
        m: 0 | 1 | 2 | 3;
        b: string;
        u: string;
        type: "string" | "id";
        mods: number;
    }): Promise<any>;
}
import Beatmap = require("./base/Beatmap");
import User = require("./base/User");
import Score = require("./base/Score");
import Match = require("./base/Match");
