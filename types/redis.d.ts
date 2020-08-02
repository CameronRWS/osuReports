import { Commands } from "ioredis";

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

export {};
