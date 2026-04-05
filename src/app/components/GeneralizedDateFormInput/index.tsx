import type { FC } from "react";

const YEAR_INPUT_ID = "add-release-date-year";

type GeneralizedDateFormInputProps = {
  year: string;
  onYearChange: (year: string) => void;
};

const GeneralizedDateFormInput: FC<GeneralizedDateFormInputProps> = ({
  year,
  onYearChange,
}) => {
  return (
    <>
      <label htmlFor={YEAR_INPUT_ID}>Year</label>
      <input
        id={YEAR_INPUT_ID}
        type="number"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        autoComplete="off"
      />
    </>
  );
};

export default GeneralizedDateFormInput;
