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
        '-2': string;
        '-1': string;
        '0': string;
        '1': string;
        '2': string;
        '3': string;
        '4': string;
    };
    const genre: {
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
    const language: {
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
    const mode: {
        '0': string;
        '1': string;
        '2': string;
        '3': string;
    };
}
export namespace Multiplayer {
    const scoringType: {
        '0': string;
        '1': string;
        '2': string;
        '3': string;
    };
    const teamType: {
        '0': string;
        '1': string;
        '2': string;
        '3': string;
    };
    const team: {
        '0': string;
        '1': string;
        '2': string;
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
    'Catch the Beat': (c: any) => number;
    /**
     * Calculates accuracy based on hit counts for mania games
     * @param {Object} c Hit counts
     */
    Mania: (c: any) => number;
};
