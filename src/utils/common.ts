import type { GeneralizedDate } from "@/types/date";

/**
 * Formats generalized date as `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`.
 * It is not assumed that input represents a valid calendar date.
 *
 * Month and day numbers are padded to (at least) 2 digits when present.
 */
export const formatGeneralizedDate = (date: GeneralizedDate): string => {
  const dateParts = [String(date.year)];

  if (date.month !== undefined) {
    dateParts.push(String(date.month).padStart(2, "0"));
  }

  if (date.day !== undefined) {
    dateParts.push(String(date.day).padStart(2, "0"));
  }

  return dateParts.join("-");
};

/**
 * Parses `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` (month and day segments optional).
 * Returns `null` for null/undefined, blank strings, or strings that do not match the shape.
 */
export const parseGeneralizedDateString = (
  value: string | null | undefined,
): GeneralizedDate | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  const match = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/.exec(trimmed);

  if (match === null) {
    return null;
  }

  const year = Number(match[1]);
  const month = match[2] === undefined ? undefined : Number(match[2]);
  const day = match[3] === undefined ? undefined : Number(match[3]);

  const generalizedDate: GeneralizedDate = { year };

  if (month !== undefined) {
    generalizedDate.month = month;
  }

  if (day !== undefined) {
    type GeneralizedDateWithMonth = GeneralizedDate & { month: number };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- day present ⇒ month set by regex; narrow for second union member
    (generalizedDate as GeneralizedDateWithMonth).day = day;
  }

  return generalizedDate;
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
