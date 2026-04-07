import { useMemo, type FC } from "react";

import styles from "./GeneralizedDateFormInput.module.css";

import type { GeneralizedDate } from "@/types/date";
import {
  daysInCalendarMonth,
  startOfToday,
  toValidCalendarDate,
} from "@/utils/date";
import {
  generalizedDateMonthSchema,
  generalizedDateYearSchema,
} from "@/validation/generalizedDate";
import { getReleaseDateStartFromOriginalReleaseDate } from "@/validation/releases/addReleaseForm";

const YEAR_INPUT_ID = "add-release-date-year";
const MONTH_INPUT_ID = "add-release-date-month";
const DAY_INPUT_ID = "add-release-date-day";

export type GeneralizedDateFormInputValue = {
  year: string;
  month: string;
  day: string;
};

type GeneralizedDateFormInputProps = {
  date: GeneralizedDateFormInputValue;
  setDate: (date: GeneralizedDateFormInputValue) => void;

  /** When set (e.g. entry original release), inputs are floored like the lower bound in generalized-date validation. */
  originalReleaseDate?: string | null;

  /**
   * Fired when any segment blurs — parent should validate the whole date as one field.
   */
  onBlur?: () => void;

  /**
   * Id of the live error element for this group (`aria-describedby` on each segment when `invalid`).
   */
  groupErrorId?: string;

  /**
   * Drives `aria-invalid` on each segment when the grouped value failed validation.
   */
  invalid?: boolean;
};

const GeneralizedDateFormInput: FC<GeneralizedDateFormInputProps> = ({
  date,
  setDate,
  originalReleaseDate,
  onBlur,
  groupErrorId,
  invalid = false,
}) => {
  const { year, month, day } = date;

  const earliestDate = useMemo(
    () => getReleaseDateStartFromOriginalReleaseDate(originalReleaseDate),
    [originalReleaseDate],
  );

  const yearParsed = generalizedDateYearSchema.safeParse(year).data;
  const monthParsed = generalizedDateMonthSchema.safeParse(month).data;

  const { minYear, minMonth, minDay } = getGeneralizedDateInputMinLimits(
    yearParsed,
    monthParsed,
    earliestDate,
  );

  const { maxYear, maxMonth, maxDay } = getGeneralizedDateInputMaxLimits(
    yearParsed,
    monthParsed,
  );

  const monthSelectValue =
    monthParsed !== undefined &&
    monthParsed >= minMonth &&
    monthParsed <= maxMonth
      ? String(monthParsed)
      : "";

  const yearFilled = yearParsed !== undefined;
  const monthFilled = monthParsed !== undefined;

  const describedBy =
    invalid && groupErrorId !== undefined && groupErrorId !== ""
      ? groupErrorId
      : undefined;

  return (
    <div className={styles.row}>
      <div className={styles.segment}>
        <label className={styles.label} htmlFor={YEAR_INPUT_ID}>
          Year
        </label>
        <input
          id={YEAR_INPUT_ID}
          className={styles.input}
          type="number"
          value={year}
          min={minYear}
          max={maxYear}
          onChange={(e) => {
            const nextYear = e.target.value.trim();
            const nextDate =
              nextYear === ""
                ? { year: "", month: "", day: "" }
                : { ...date, year: nextYear };

            setDate(nextDate);
          }}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete="off"
        />
      </div>
      <div className={styles.segment}>
        <label className={styles.label} htmlFor={MONTH_INPUT_ID}>
          Month
        </label>
        <select
          id={MONTH_INPUT_ID}
          className={styles.input}
          value={monthSelectValue}
          onChange={(e) => {
            const nextMonth = e.target.value;
            const nextDate =
              nextMonth === ""
                ? { ...date, month: "", day: "" }
                : { ...date, month: nextMonth };

            setDate(nextDate);
          }}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={!yearFilled}
          autoComplete="off"
        >
          <option value="" />
          {Array.from(
            { length: Math.max(0, maxMonth - minMonth + 1) },
            (_, i) => i + minMonth,
          ).map((m) => (
            <option key={m} value={String(m)}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.segment}>
        <label className={styles.label} htmlFor={DAY_INPUT_ID}>
          Day
        </label>
        <input
          id={DAY_INPUT_ID}
          className={styles.input}
          type="number"
          min={minDay}
          max={maxDay}
          value={day}
          onChange={(e) => setDate({ ...date, day: e.target.value })}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={!monthFilled}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

const MIN_CALENDAR_YEAR = 1900;

const getGeneralizedDateInputMinLimits = (
  year: number | undefined,
  month: number | undefined,
  start: GeneralizedDate | undefined,
) => {
  const startCal = toValidCalendarDate(start, false);

  if (startCal === null) {
    return { minYear: MIN_CALENDAR_YEAR, minMonth: 1, minDay: 1 };
  }

  const minYear = startCal.getUTCFullYear();
  const startMonth = startCal.getUTCMonth() + 1;
  const startDay = startCal.getUTCDate();

  const minYearSelected = year === minYear;
  const minMonthSelected = month === startMonth;

  const minMonth = minYearSelected ? startMonth : 1;

  const minDay = minYearSelected && minMonthSelected ? startDay : 1;

  return { minYear, minMonth, minDay };
};

const getGeneralizedDateInputMaxLimits = (
  year: number | undefined,
  month: number | undefined,
) => {
  const today = startOfToday();
  const thisYear = today.getUTCFullYear();
  const maxMonthThisYear = today.getUTCMonth() + 1;

  const yearIsValid = year !== undefined;
  const monthIsValid = month !== undefined;

  const thisYearIsSelected = year === thisYear;
  const thisMonthIsSelected = month === maxMonthThisYear;

  const maxMonth = thisYearIsSelected ? maxMonthThisYear : 12;

  const maxDay =
    thisYearIsSelected && thisMonthIsSelected
      ? today.getUTCDate() // current day
      : yearIsValid && monthIsValid
        ? daysInCalendarMonth(year, month)
        : 31;

  return { maxYear: thisYear, maxMonth, maxDay };
};

export default GeneralizedDateFormInput;
