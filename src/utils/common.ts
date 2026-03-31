export const flattenStringOrArray = (value: string | string[]): string[] =>
  typeof value === "string" ? [value] : value;

export const joinStringOrArray = (value: string | string[]): string =>
  Array.isArray(value) ? value.join(", ") : value;
