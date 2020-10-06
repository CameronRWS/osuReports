import jimp from "jimp";
import { Font } from "@jimp/plugin-print";
declare const INITIAL_FONTS: {
    ubuntuBBlue32: string;
    ubuntuBBlack32: string;
    ubuntuBRed32: string;
    ubuntuBGreen32: string;
    ubuntuBBlack24: string;
    ubuntuBGreen24: string;
    ubuntuBRed24: string;
    ubuntuBBlue24: string;
    ubuntuBLightBlue32: string;
    ubuntuBLightBlue24: string;
    ubuntuBWhite24: string;
    ubuntuBWhite32: string;
    ubuntuBGold52: string;
    ubuntuBYellow32: string;
    ubuntuBLightGreen32: string;
    ubuntuBLightRed32: string;
};
declare class ResourceGetter {
    protected cache: {
        images: Record<string, Promise<jimp> | Promise<jimp>[]>;
        fonts: Record<keyof typeof INITIAL_FONTS, Promise<Font>>;
    };
    protected lru: LRUCache<jimp>;
    constructor();
    getPlayerAvatar(userId: any): Promise<jimp>;
    getPlayerCountryFlag(countryFlag: any): any;
    getAndCacheImage(key: any, url: any): Promise<jimp>;
    getImage(key: any, variant?: number | undefined): Promise<jimp>;
    /**
     * Gets a font by name
     * @param name
     */
    getFont(name: keyof typeof INITIAL_FONTS): Promise<Font>;
    getNewReportTemplate(): Promise<jimp>;
    /**
     * Fetch an OSU background by URL
     * @param {string} url
     */
    getBackground(url: any): Promise<{
        background: jimp;
        isDefault: boolean;
    } | {
        background: jimp;
        isDefault: boolean;
    }>;
}
declare class LRUCache<T> {
    protected maxSize: number;
    /**
     * contains the key: value lookups
     */
    protected cache: {
        [key: string]: T;
    };
    /**
     * this will contain the order in which the keys were last accessed
     * @private
     * @type { string[] }
     */
    protected accessed: string[];
    /**
     * Creates a new LRU cache
     * @param {number} maxSize The size of the LRU cache
     */
    constructor(maxSize: number);
    /**
     * Retrieves a value from the LRU cache or fetches it if it does not exist
     * @param key The key to retrieve from the LRU cache
     * @param getter Called to create the value if it's not cached
     */
    get(key: string, getter: () => Promise<T>): Promise<T>;
}
declare const _default: ResourceGetter;
export = _default;
//# sourceMappingURL=index.d.ts.map