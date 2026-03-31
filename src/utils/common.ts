export const flattenStringOrArray = (value: string | string[]): string[] =>
  typeof value === "string" ? [value] : value;
