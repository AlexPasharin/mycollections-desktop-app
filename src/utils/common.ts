/**
 * Shallow copy of `object` with property `key` removed.
 * If `object` is  `undefined`, returns it unchanged.
 */
export function omitProperty<
  T extends Record<PropertyKey, unknown>,
  K extends keyof T,
>(object: undefined, key: K): undefined;
export function omitProperty<
  T extends Record<PropertyKey, unknown>,
  K extends keyof T,
>(object: T, key: K): Omit<T, K>;
export function omitProperty<
  T extends Record<PropertyKey, unknown>,
  K extends keyof T,
>(object: T | undefined, key: K): Omit<T, K> | undefined;

export function omitProperty<
  T extends Record<PropertyKey, unknown>,
  K extends keyof T,
>(object: T | undefined, key: K): Omit<T, K> | undefined {
  if (object === undefined) {
    return object;
  }

  const { [key]: _removed, ...rest } = object;

  return rest;
}

/**
 * Indices of items whose value at `key` repeats an earlier item's value at that key (in terms of basic equality)
 * If key is not given, uses basic equality comparison.
 * If ignoreValues is given, items whose value at `key` (or just the item itself if key is not given) is in `ignoreValues` are ignored.
 */
export const duplicateIndicesByKey = <T, K extends keyof T>(
  items: readonly T[],
  ignoreValues: unknown[] = [],
  key?: K,
): number[] => {
  const seen = new Set();
  const indicesOfDuplicates: number[] = [];

  let index = 0;

  for (const item of items) {
    const value = key ? item[key] : item;

    if (ignoreValues.includes(value)) {
      continue;
    }

    if (seen.has(value)) {
      indicesOfDuplicates.push(index);
    } else {
      seen.add(value);
    }

    index += 1;
  }

  return indicesOfDuplicates;
};

export const flattenStringOrArray = (value: string | string[]): string[] =>
  typeof value === "string" ? [value] : value;

export const joinStringOrArray = (value: string | string[]): string =>
  Array.isArray(value) ? value.join(", ") : value;

export const formatJson = (value: unknown): string | null => {
  switch (typeof value) {
    case "object":
      return value === null ? null : JSON.stringify(value, null, 2);
    case "undefined":
      return null;
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
    case "function":
      return value.toString();
  }
};

export const isDateInputFieldKey = (key: unknown) =>
  key === "year" || key === "month" || key === "day";

export const nullIfEmpty = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
};

export const matchesTrimmedCaseInsensitiveSubstring = (
  text: string,
  query: string,
): boolean => text.toLowerCase().includes(query.trim().toLowerCase());
