declare global {
  interface Array<T> {
    any(predicate: (el: T, idx: number, ary: Array<T>) => boolean): boolean;
  }
}

export {};
