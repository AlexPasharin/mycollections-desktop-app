/**
 * Indices of items whose value at `key` repeats an earlier item's value at that key (in terms of basic equality)
 */
export const duplicateIndicesByKey = <T, K extends keyof T>(
  items: readonly T[],
  key: K,
): number[] => {
  const seen = new Set<T[K]>();
  const indicesOfDuplicates: number[] = [];

  let index = 0;

  for (const item of items) {
    const value = item[key];

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
