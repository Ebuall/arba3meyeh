// export type Ref<T> = { val: T };
// export function Ref<T>(val: T): Ref<T> {
//   return { val };
// }
// export namespace Ref {
//   export function upd<T>(ref: Ref<T>, f: (val: T) => T) {
//     ref.val = f(ref.val);
//     return ref;
//   }
//   export function get<T>(ref: Ref<T>) {
//     return ref.val;
//   }
// }

export class Ref<T> {
  constructor(public val: T) {}
  /** Update in place */
  upd(f: (val: T) => T) {
    this.val = f(this.val);
    return this;
  }
}
