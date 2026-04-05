import type { GeneralizedDate } from "@/types/date";

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
