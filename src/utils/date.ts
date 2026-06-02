import { ENGLISH_MONTH_NAMES } from "@/constants";
import type { GeneralizedDate, GeneralizedDateFromDb } from "@/types/date";
import { createGeneralizedDateSchema } from "@/validation";

/**
 * Formats generalized date for display, e.g. `2000`, `2000, January`, or `2000, January 14`.
 * It is not assumed that input represents a valid calendar date.
 *
 * When month is present but not in 1–12, falls back to `YYYY-MM` or `YYYY-MM-DD` (padded segments).
 */
export const formatGeneralizedDate = (date: GeneralizedDate): string => {
  const { year, month, day } = date;

  if (month === undefined) {
    return String(year);
  }

  if (month < 1 || month > 12) {
    const parts = [String(year), String(month).padStart(2, "0")];

    if (day !== undefined) {
      parts.push(String(day).padStart(2, "0"));
    }

    return parts.join("-");
  }

  const monthLabel = ENGLISH_MONTH_NAMES[month - 1];

  return `${year}, ${monthLabel}${day === undefined ? "" : ` ${day}`}`;
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

  const match = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/.exec(value.trim());

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
    generalizedDate.day = day;
  }

  return generalizedDate;
};

/**
 * Parses a DB text generalized date: shape check via {@link parseGeneralizedDateString}, then Zod calendar rules.
 * Empty or whitespace-only input yields `null`; invalid non-empty shape yields an error object with the raw string.
 */
export const parseStringAsGeneralizedDate = (
  value: string | null,
): GeneralizedDateFromDb => {
  if (value === null) {
    return null;
  }

  const parsed = parseGeneralizedDateString(value);

  if (parsed === null) {
    return {
      value,
      error: "Use a hyphen-separated date: YYYY, YYYY-MM, or YYYY-MM-DD.",
    };
  }

  const validated = createGeneralizedDateSchema().safeParse(parsed);

  if (!validated.success) {
    return {
      value,
      error: validated.error.issues[0]?.message ?? "Invalid release date.",
    };
  }

  return validated.data;
};

/** Today’s calendar date at **00:00:00.000 UTC**. */
export const startOfToday = (): Date => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

/**
 * Calendar length of `month` (**1–12**) for `year`, in UTC
 */
export const daysInCalendarMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * Converts a generalized date to a UTC `Date` at **00:00:00.000 UTC** for that calendar day,
 * or `null` if `date` is undefined, year is not given or the combination is invalid (e.g. 2023-02-30).
 *
 * When month and/or day are omitted, the missing parts are filled like SQL `generalised_date_to_date`:
 * - `moveForwardIfIncomplete === false` (default): month → 1, day → 1 (start of year or month).
 * - `moveForwardIfIncomplete === true`: year-only → Dec 31; year-month only → last day of that month.
 */
export const toValidCalendarDate = (
  date: GeneralizedDate | null | undefined,
  moveForwardIfIncomplete = false,
): Date | null => {
  if (date?.year === undefined) {
    return null;
  }

  const { year, month, day } = date;
  const hasMonth = month !== undefined;
  const hasDay = day !== undefined;

  const m = hasMonth ? month : moveForwardIfIncomplete ? 12 : 1;
  const d = hasDay
    ? day
    : moveForwardIfIncomplete
      ? daysInCalendarMonth(year, m)
      : 1;
  const calendarDate = new Date(Date.UTC(year, m - 1, d));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== m - 1 ||
    calendarDate.getUTCDate() !== d
  ) {
    return null;
  }

  return calendarDate;
};

export const sanitizeReleaseDate = (
  date: GeneralizedDateFromDb,
): GeneralizedDate | null => (date !== null && "error" in date ? null : date);
