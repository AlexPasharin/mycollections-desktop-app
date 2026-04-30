import { type FC } from "react";

import styles from "./AddReleaseMatrixRunoutField.module.css";

import type { AddReleaseFormFieldError } from "../addReleaseFormUtils/errorMessages";
import type { AddReleaseFormMatrixRunoutDraft } from "../addReleaseFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";

const MATRIX_RUNOUT_FIELD_ERROR_ID = "add-release-matrix-runout-error";

type AddReleaseMatrixRunoutFieldProps = {
  matrixRunout: AddReleaseFormMatrixRunoutDraft;
  errorMessages: AddReleaseFormFieldError[];
  onValueChange: (value: string) => void;
  onTreatAsTextChange: (treatAsText: boolean) => void;
  onFocus: () => void;
  onBlur: () => void;
};

const AddReleaseMatrixRunoutField: FC<AddReleaseMatrixRunoutFieldProps> = ({
  matrixRunout,
  errorMessages,
  onValueChange,
  onTreatAsTextChange,
  onFocus,
  onBlur,
}) => {
  const hasErrors = errorMessages.length > 0;

  return (
    <div className={styles.field}>
      <label className={styles.heading} htmlFor="add-release-matrix-runout">
        Matrix / runout
      </label>
      <textarea
        id="add-release-matrix-runout"
        className={styles.textarea}
        rows={4}
        value={matrixRunout.value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? MATRIX_RUNOUT_FIELD_ERROR_ID : undefined}
        autoComplete="off"
      />
      <div className={styles.checkboxRow}>
        <input
          id="add-release-matrix-runout-plain-text"
          type="checkbox"
          checked={matrixRunout.treatAsText}
          onChange={(e) => onTreatAsTextChange(e.target.checked)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <label
          className={styles.checkboxLabel}
          htmlFor="add-release-matrix-runout-plain-text"
        >
          treat as plain text, not json object
        </label>
      </div>
      <FormFieldErrorMessages
        id={MATRIX_RUNOUT_FIELD_ERROR_ID}
        messages={errorMessages}
      />
    </div>
  );
};

export default AddReleaseMatrixRunoutField;
