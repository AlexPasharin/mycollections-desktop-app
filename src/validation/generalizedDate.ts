import { z } from "zod";

import { MIN_CALENDAR_YEAR } from "@/constants";
import type { GeneralizedDate } from "@/types/date";
import {
  formatGeneralizedDate,
  startOfToday,
  toValidCalendarDate,
} from "@/utils/date";
import { coercedIntSchema } from "@/validation/common";

// Implements same validation logic as described in documentation/database/validation_functions/generalized_date_field_validation.md

export type { GeneralizedDate };

/**
 * Zod schema for a generalized date. Numeric ranges are enforced by the object shape; refinements run
 * `validateGeneralizedDateInput` (calendar rules and no future dates). When `startDate` is given and parses
 * successfully, a separate lower-bound check runs: value as `moveForwardIfIncomplete` true vs start as false
 * (same idea as SQL `generalised_date_to_date(value, TRUE) < generalised_date_to_date(start, FALSE)`).
 */
export const createGeneralizedDateSchema = (
  startDate?: GeneralizedDate | null,
): z.ZodType<GeneralizedDate> =>
  z
    .strictObject({
      year: generalizedDateYearSchema,
      month: generalizedDateMonthSchema,
      day: coercedIntSchema,
    })
    .superRefine((date, ctx) => {
      if (date.day !== undefined && date.month === undefined) {
        const message = "Month is required when day is provided.";

        ctx.addIssue({
          code: "custom",
          path: ["month"],
          message,
        });
        ctx.addIssue({
          code: "custom",
          path: ["day"],
          message,
        });

        return;
      }

      const generalizedDateValidationResult =
        validateGeneralizedDateInput(date);

      if (!generalizedDateValidationResult.success) {
        ctx.addIssue({
          code: "custom",
          message: generalizedDateValidationResult.message,
        });

        return;
      }

      const startBoundValidationResult = validateGeneralizedDateAgainstStart(
        date,
        startDate,
      );

      if (!startBoundValidationResult.success) {
        ctx.addIssue({
          code: "custom",
          message: startBoundValidationResult.message,
        });
      }
    });

const YEAR_MIN_MESSAGE = `Year must be ${MIN_CALENDAR_YEAR} or later.`;

export const generalizedDateYearSchema = coercedIntSchema.pipe(
  z.int().min(MIN_CALENDAR_YEAR, { error: YEAR_MIN_MESSAGE }),
);

const MONTH_RANGE_MESSAGE = "Month must be between 1 and 12.";

export const generalizedDateMonthSchema = coercedIntSchema.pipe(
  z.optional(
    z
      .int()
      .min(1, { error: MONTH_RANGE_MESSAGE })
      .max(12, { error: MONTH_RANGE_MESSAGE }),
  ),
);

type ParseGeneralizedResult =
  | { success: true; date: Date }
  | { success: false; message: string };

/**
 * Calendar validity and no future dates.
 * `moveForwardIfIncomplete` matches `toValidCalendarDate` / SQL `generalised_date_to_date` (default `false`).
 */
const validateGeneralizedDate = (
  date: GeneralizedDate,
  moveForwardIfIncomplete = false,
): ParseGeneralizedResult => {
  const calendarDate = toValidCalendarDate(date, moveForwardIfIncomplete);

  if (calendarDate === null) {
    const formattedDate = formatGeneralizedDate(date);

    return {
      success: false,
      message: `Value "${formattedDate}" does not represent a valid existing date.`,
    };
  }

  return { success: true, date: calendarDate };
};

/** Upper bound of `value` (move forward if incomplete) vs lower bound of `startDate` (SQL-style). */
const validateGeneralizedDateAgainstStart = (
  value: GeneralizedDate,
  startDate: GeneralizedDate | null | undefined,
) => {
  if (!startDate) {
    return { success: true };
  }

  const startDateValidationResult = validateGeneralizedDate(startDate, false);

  if (!startDateValidationResult.success) {
    return { success: true };
  }

  const dateValidationResult = validateGeneralizedDate(value, true);

  if (!dateValidationResult.success) {
    return { success: true };
  }

  const valueUpperBoundDate = dateValidationResult.date;
  const startLowerBoundDate = startDateValidationResult.date;

  if (valueUpperBoundDate.getTime() < startLowerBoundDate.getTime()) {
    const formattedValue = formatGeneralizedDate(value);

    const formattedStartDate = formatGeneralizedDate({
      year: startLowerBoundDate.getUTCFullYear(),
      month: startLowerBoundDate.getUTCMonth() + 1,
      day: startLowerBoundDate.getUTCDate(),
    });

    return {
      success: false,
      message: `Value "${formattedValue}" cannot be before "${formattedStartDate}" (given start date).`,
    };
  }

  return { success: true };
};

const validateGeneralizedDateInput = (
  date: GeneralizedDate,
): { success: true } | { success: false; message: string } => {
  const dateValidationResult = validateGeneralizedDate(date);

  if (!dateValidationResult.success) {
    return dateValidationResult;
  }

  const { date: calendarDate } = dateValidationResult;

  if (calendarDate > startOfToday()) {
    const formattedDate = formatGeneralizedDate(date);

    return {
      success: false,
      message: `Value "${formattedDate}" represents a date in the future.`,
    };
  }

  return { success: true };
};
