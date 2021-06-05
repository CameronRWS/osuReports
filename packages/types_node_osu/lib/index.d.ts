export const Api: typeof import("./lib/Api.js");
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
        ScoreV2: number;
        Mirror: number;
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
            '-2': string;
            '-1': string;
            '0': string;
            '1': string;
            '2': string;
            '3': string;
            '4': string;
        };
        readonly genre: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
            '4': string;
            '5': string;
            '6': string;
            '7': string;
            '9': string;
            '10': string;
        };
        readonly language: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
            '4': string;
            '5': string;
            '6': string;
            '7': string;
            '8': string;
            '9': string;
            '10': string;
            '11': string;
        };
        readonly mode: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    };
    Multiplayer: {
        readonly scoringType: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
        readonly teamType: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
        readonly team: {
            '0': string;
            '1': string;
            '2': string;
        };
    };
    AccuracyMethods: {
        Standard: (c: any) => number;
        Taiko: (c: any) => number;
        'Catch the Beat': (c: any) => number;
        Mania: (c: any) => number;
    };
};
export const Beatmap: typeof import("./lib/base/Beatmap.js");
export const Score: typeof import("./lib/base/Score.js");
export const User: typeof import("./lib/base/User.js");
export const Match: typeof import("./lib/base/Match.js");
export const Game: typeof import("./lib/base/Game.js");
export const MultiplayerScore: typeof import("./lib/base/MultiplayerScore.js");
export const Event: typeof import("./lib/base/Event.js");
