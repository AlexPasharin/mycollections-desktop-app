import { z } from "zod";

import type { GeneralizedDate } from "@/types/date";
import { formatGeneralizedDate } from "@/utils/common";
import { startOfToday, toValidCalendarDate } from "@/utils/date";

// Implements same validation logic as described in documentation/database/validation_functions/generalized_date_field_validation.md

export type { GeneralizedDate };

/**
 * Zod schema for a generalized date. Numeric ranges are enforced by the object shape; refinements run
 * `validateGeneralizedDate` (calendar rules and no future dates) and, when `startDate` is given and parses
 * successfully, enforce a lower bound (invalid or future `startDate` is ignored).
 */
export const createGeneralizedDateSchema = (
  startDate?: GeneralizedDate,
): z.ZodType<GeneralizedDate> => {
  let notBefore: Date | undefined;

  if (startDate) {
    const startParsed = validateGeneralizedDate(startDate);

    if (startParsed.success) {
      notBefore = startParsed.date;
    }
  }

  return z
    .object({
      year: z.int().min(1900).max(2099),
      month: z.int().min(1).max(12).optional(),
      day: z.int().min(1).max(31).optional(),
    })
    .superRefine((obj, ctx) => {
      const r = validateGeneralizedDateInput(obj, notBefore);

      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          message: r.message,
        });
      }
    });
};

type ParseGeneralizedResult =
  | { success: true; date: Date; formattedDate: string }
  | { success: false; message: string };

/** Calendar validity, day-without-month rule, and no future dates. */
const validateGeneralizedDate = (
  date: GeneralizedDate,
): ParseGeneralizedResult => {
  const hasMonth = date.month !== undefined;
  const hasDay = date.day !== undefined;

  if (hasDay && !hasMonth) {
    return {
      success: false,
      message: "Month is required when day is specified.",
    };
  }

  const formattedDate = formatGeneralizedDate(date);
  const calendarDate = toValidCalendarDate(date);

  if (calendarDate === null) {
    return {
      success: false,
      message: `Value "${formattedDate}" does not represent a valid existing date.`,
    };
  }

  if (calendarDate > startOfToday()) {
    return {
      success: false,
      message: `Value "${formattedDate}" represents a date in the future.`,
    };
  }

  return { success: true, date: calendarDate, formattedDate };
};

const validateGeneralizedDateInput = (
  date: GeneralizedDate,
  notBefore?: Date,
): { success: true } | { success: false; message: string } => {
  const dateValidationResult = validateGeneralizedDate(date);

  if (!dateValidationResult.success) {
    return dateValidationResult;
  }

  const { date: calendarDate, formattedDate } = dateValidationResult;

  if (notBefore && calendarDate.getTime() < notBefore.getTime()) {
    return {
      success: false,
      message: `Value "${formattedDate}" cannot be before ${formatGeneralizedDate(
        {
          year: notBefore.getUTCFullYear(),
          month: notBefore.getUTCMonth() + 1,
          day: notBefore.getUTCDate(),
        },
      )}.`,
    };
  }

  return { success: true };
};
