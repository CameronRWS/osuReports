import { getPlayerInfo } from "~/src/server/api";

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

declare module "*.png" {
  const value: string;
  export default value;
}

export {};
