import type { FC } from "react";

import styles from "../AddReleaseCatalogueNumbersRow.module.css";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import { errorSetToMessages } from "@/validation";

export type CatalogueNumberInputColumnProps = {
  /** Visible heading shown once at the top of the column (e.g. "Catalogue
   * numbers", "Catalogue numbers in Europe"). */
  columnHeading: string;

  /** Singular accessible label per input ("Catalogue number",
   * "Catalogue number in Europe"). Each input gets `${label} ${index + 1}` as
   * its aria-label, since the visible heading is shared by the whole column. */
  inputAriaLabel: string;

  /** Prefix used to build stable DOM ids: `${idPrefix}-${rowId}-${inputId}` for
   * the input and `${errorIdPrefix}-${rowId}-${inputId}` for the error
   * region. */
  idPrefix: string;
  errorIdPrefix: string;
  rowId: string;
  inputValues: { id: string; value: string }[];
  errorMessagesByInputId: Record<string, Set<string>> | undefined;
  canRemoveAnyInput: boolean;
  addButtonLabel: string;
  removeInputAriaLabel: string;
  onSetValue: (inputValueId: string, value: string) => void;
  onAddInput: () => void;
  onRemoveInput: (inputValueId: string) => void;
  onInputFocus: (inputValueId: string) => void;
  onInputBlur: () => void;
};

const CatalogueNumberInputColumn: FC<CatalogueNumberInputColumnProps> = ({
  columnHeading,
  inputAriaLabel,
  idPrefix,
  errorIdPrefix,
  rowId,
  inputValues,
  errorMessagesByInputId,
  canRemoveAnyInput,
  addButtonLabel,
  removeInputAriaLabel,
  onSetValue,
  onAddInput,
  onRemoveInput,
  onInputFocus,
  onInputBlur,
}) => (
  <div className={styles.column}>
    <div className={styles.columnHeading}>{columnHeading}</div>
    {inputValues.map((inputValue, index) => {
      const errorMessages = errorSetToMessages(
        errorMessagesByInputId?.[inputValue.id],
      );
      const inputId = `${idPrefix}-${rowId}-${inputValue.id}`;
      const errorId = `${errorIdPrefix}-${rowId}-${inputValue.id}`;
      const hasErrors = errorMessages != null && errorMessages.length > 0;

      return (
        <div key={inputValue.id} className={styles.inputValueBlock}>
          <div className={styles.controlWithRemove}>
            <input
              id={inputId}
              className={styles.input}
              type="text"
              value={inputValue.value}
              aria-label={`${inputAriaLabel} ${index + 1}`}
              aria-invalid={hasErrors}
              aria-describedby={hasErrors ? errorId : undefined}
              onChange={(e) => onSetValue(inputValue.id, e.target.value)}
              onFocus={() => onInputFocus(inputValue.id)}
              onBlur={onInputBlur}
              autoComplete="off"
            />
            <div
              className={styles.removeCrossInputValue}
              aria-hidden={canRemoveAnyInput ? undefined : true}
            >
              {canRemoveAnyInput && (
                <button
                  type="button"
                  className={styles.removeCross}
                  aria-label={removeInputAriaLabel}
                  title={removeInputAriaLabel}
                  onClick={() => onRemoveInput(inputValue.id)}
                >
                  <span aria-hidden="true">❌</span>
                </button>
              )}
            </div>
          </div>
          <div className={styles.fieldErrorSlot}>
            <FormFieldErrorMessages id={errorId} messages={errorMessages} />
          </div>

        </div>
      );
    })}
    <div className={styles.rowActions}>
      <button
        type="button"
        className={styles.addAnotherInputValue}
        onClick={onAddInput}
      >
        {addButtonLabel}
      </button>
    </div>
  </div>
);

export default CatalogueNumberInputColumn;

