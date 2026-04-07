import type { FC } from "react";

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
  const yearFilled = year.trim() !== "";

  return (
    <>
      <label htmlFor={YEAR_INPUT_ID}>Year</label>
      <input
        id={YEAR_INPUT_ID}
        type="number"
        value={year}
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
      <label htmlFor={MONTH_INPUT_ID}>Month</label>
      <input
        id={MONTH_INPUT_ID}
        type="number"
        min={1}
        max={12}
        value={month}
        onChange={(e) => {
          const nextMonth = e.target.value.trim();
          const nextDate =
            nextMonth === ""
              ? { ...date, month: "", day: "" }
              : { ...date, month: nextMonth };

          setDate(nextDate);
        }}
        disabled={!yearFilled}
        autoComplete="off"
      />
      <label htmlFor={DAY_INPUT_ID}>Day</label>
      <input
        id={DAY_INPUT_ID}
        type="number"
        min={1}
        max={31}
        value={day}
        onChange={(e) => setDate({ ...date, day: e.target.value })}
        disabled={!yearFilled || month.trim() === ""}
        autoComplete="off"
      />
    </>
  );
};

export default GeneralizedDateFormInput;
