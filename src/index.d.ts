declare module "ioredis" {
  interface Commands {
    lruUpdate(
      lruKey: string,
      member: string,
      timestamp: string,
      maxSize: number
    ): Promise<string | null>;
  }
}

export {};
