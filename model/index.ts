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

export function parseBool(s: unknown) {
  if (typeof s === "boolean") return s;
  if (typeof s === "string") return s == "true";
  if (typeof s === "number") return s > 0;
  return false;
}
