import type { GeneralizedDate } from "@/types/date";

/** Today’s calendar date at **00:00:00.000 UTC**. */
export const startOfToday = (): Date => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

/**
 *  returns given Generalized Date converted to UTC Date at **UTC** calendar midnight,
 *  or null if it does not represent a valid calendar date
 */
export const toValidCalendarDate = (date: GeneralizedDate): Date | null => {
  const { year, month, day } = date;
  const hasMonth = month !== undefined;
  const hasDay = day !== undefined;

  if (hasDay && !hasMonth) {
    return null;
  }

  const m = hasMonth ? month : 1;
  const d = hasDay ? day : 1;
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
