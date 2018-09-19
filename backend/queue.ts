import { Option } from "fp-ts/lib/Option";
import { last } from "fp-ts/lib/Array";

export class Queue<T> {
  constructor(private value: T[]) {}

  enqueue(v: T): Queue<T> {
    return new Queue([v, ...this.value]);
  }

  dequeue(): [Option<T>, Queue<T>] {
    const first = last(this.value);
    const rest = this.value.slice(0, -1);
    return [first, new Queue(rest)];
  }

  *[Symbol.iterator](this: Queue<T>) {
    let self = this;
    while (true) {
      const [first, rest] = self.dequeue();
      if (first.isSome()) yield first.value;
      else return;
      self = rest;
    }
  }

  static of<T>(...args: T[]): Queue<T> {
    return new Queue(args);
  }
}
