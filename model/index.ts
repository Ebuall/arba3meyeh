export * from "./cards";
export * from "./user";
export * from "./ref";

export const mapNullable = <T, U>(f: (n: T) => U) => (
  v: T | null | undefined,
) => {
  if (v == null) {
    return v;
  } else {
    return f(v);
  }
};
