import { RedisClient as OrigClient } from 'redis';

type LastArg<F> = F extends (cb: infer A) => any
  ? A
  : F extends (arg0: any, cb: infer A) => any
  ? A
  : F extends (arg0: any, arg1: any, cb: infer A) => any
  ? A
  : F extends (arg0: any, arg1: any, arg2: any, cb: infer A) => any
  ? A
  : never;

declare module 'redis' {
  interface RedisClient {
    getAsync(key: string): Promise<string>;
    setAsync(key: string, value: string): Promise<'OK'>;
    keysAsync(prefix: string): Promise<string[]>;
    mgetAsync(keys: string[]): Promise<string[]>;
    delAsync(key: string): Promise<number>;
  }
}
