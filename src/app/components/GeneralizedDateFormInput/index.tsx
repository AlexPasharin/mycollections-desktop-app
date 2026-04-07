import type { FC } from "react";

import styles from "./GeneralizedDateFormInput.module.css";

import { daysInCalendarMonth, startOfToday } from "@/utils/date";
import {
  generalizedDateMonthSchema,
  generalizedDateYearSchema,
} from "@/validation/generalizedDate";

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
};

const GeneralizedDateFormInput: FC<GeneralizedDateFormInputProps> = ({
  date,
  setDate,
}) => {
  const { year, month, day } = date;

  const yearParsed = generalizedDateYearSchema.safeParse(year).data;
  const monthParsed = generalizedDateMonthSchema.safeParse(month).data;

  const { maxYear, maxMonth, maxDay } = getGeneralizedDateInputMaxLimits(
    yearParsed,
    monthParsed,
  );

  const monthSelectValue =
    monthParsed !== undefined && monthParsed <= maxMonth
      ? String(monthParsed)
      : "";

  const yearFilled = yearParsed !== undefined;
  const monthFilled = monthParsed !== undefined;

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
          min={1900}
          max={maxYear}
          onChange={(e) => {
            const nextYear = e.target.value.trim();
            const nextDate =
              nextYear === ""
                ? { year: "", month: "", day: "" }
                : { ...date, year: nextYear };

            setDate(nextDate);
          }}
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
          disabled={!yearFilled}
          autoComplete="off"
        >
          <option value="" />
          {Array.from({ length: maxMonth }, (_, i) => i + 1).map((m) => (
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
          min={1}
          max={maxDay}
          value={day}
          onChange={(e) => setDate({ ...date, day: e.target.value })}
          disabled={!monthFilled}
          autoComplete="off"
        />
      </div>
    </div>
  );
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
