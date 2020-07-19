import { getPlayerInfo } from "./server/api";
import apiFactory from "./api.service";

declare module "ioredis" {
  interface Commands {
    lruUpdate(
      lruKey: string,
      member: string,
      timestamp: string,
      maxSize: number
    ): Promise<string | null>;
    checkAndDelete(lock: string, sentinel: string): Promise<string>;
  }
}

type UnwrapPromise<P> = P extends Promise<infer T> ? T : never;
type AsyncReturnType<
  F extends (...args: any[]) => Promise<any>
> = UnwrapPromise<ReturnType<F>>;

declare module "@nuxt/types" {
  interface Context {
    player: AsyncReturnType<typeof getPlayerInfo>;
  }

  interface NuxtAppOptions {
    $api: ReturnType<typeof import("~/src/api.service").default>;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $api: ReturnType<typeof apiFactory>;
  }
}

import { Profile } from "passport-twitter";
import { Response as OrigResponse } from "express";

declare global {
  namespace Express {
    interface User extends Profile {}
    interface Response {
      flashes: string[];
      flash: (msg: string) => Response & OrigResponse;
      clearFlashes: () => Response & OrigResponse;
    }

    interface Request {
      flashes: string[];
    }
  }

  namespace osuReports {
    interface Play {
      sessionId: number;
      osuUsername: string;
      date: string;
      bg: string;
      title: string;
      version: string;
      artist: string;
      combo: number;
      maxCombo: number;
      bpm: number;
      playDuration: string;
      difficulty: number;
      playAccuracy: number;
      rank: number;
      mods: string;
      counts300: number;
      counts100: number;
      counts50: number;
      countsMiss: number;
      playPP: number;
      numSpinners: number;
      numSliders: number;
      numCircles: number;
      numObjects: number;
      approachRate: number;
      healthPoints: number;
      overallDifficulty: number;
      circleSize: number;
    }
  }
}

declare module "*.png" {
  const value: any;
  export = value;
}

export {};
