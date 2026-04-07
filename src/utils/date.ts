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
    generalizedDate.day = day;
  }

  return generalizedDate;
};

/** Today’s calendar date at **00:00:00.000 UTC**. */
export const startOfToday = (): Date => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

/**
 * Converts a generalized date to a UTC `Date` at **00:00:00.000 UTC** for that calendar day,
 * or `null` if the combination is invalid (e.g. 2023-02-30).
 *
 * When month and/or day are omitted, the missing parts are filled like SQL `generalised_date_to_date`:
 * - `moveForwardIfIncomplete === false` (default): month → 1, day → 1 (start of year or month).
 * - `moveForwardIfIncomplete === true`: year-only → Dec 31; year-month only → last day of that month.
 */
export const toValidCalendarDate = (
  date: GeneralizedDate,
  moveForwardIfIncomplete = false,
): Date | null => {
  const { year, month, day } = date;
  const hasMonth = month !== undefined;
  const hasDay = day !== undefined;

  const m = hasMonth ? month : moveForwardIfIncomplete ? 12 : 1;
  const d = hasDay
    ? day
    : moveForwardIfIncomplete
      ? new Date(Date.UTC(year, m, 0)).getUTCDate()
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
