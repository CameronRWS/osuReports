import { getPlayerInfo } from "./server/api";

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
}

export {};
