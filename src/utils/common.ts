import type { GeneralizedDate } from "@/types/date";

/**
 * Formats generalized date as `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`,
 * or if day is set without month: `YYYY-(invalid month)-DD`.
 * It is not assumed that input represents a valid date.
 *
 * Month and day numbers are padded to 2 digits, if necessary.
 * Of course month and day part can have more than 2 digits, if their values are greater than 99.
 */
export const formatGeneralizedDate = (date: GeneralizedDate): string => {
  const hasMonth = date.month !== undefined;
  const hasDay = date.day !== undefined;

  const dateParts = [String(date.year)];

  if (hasMonth) {
    dateParts.push(String(date.month).padStart(2, "0"));
  } else if (hasDay) {
    dateParts.push("(invalid month)");
  }

  if (hasDay) {
    dateParts.push(String(date.day).padStart(2, "0"));
  }

  return dateParts.join("-");
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
