import type { FC } from "react";

import styles from "./AddReleaseCountriesSection.module.css";

import type { AddReleaseFormCountriesSubsectionErrors } from "../addReleaseFormUtils/errorMessages";
import type { CountrySelectionInput } from "../addReleaseFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import type { CountryListItem } from "@/types/countries";
import { errorSetToMessages } from "@/validation";

type AddReleaseCountriesSectionProps = {
  countries: CountryListItem[];
  countrySelections: CountrySelectionInput[];
  onSetCountryCodeName: (inputId: string, codeName: string) => void;
  onAddRow: () => void;
  onRemoveRow: (inputId: string) => void;
  onFocus: (inputId: string) => void;
  onBlur: () => void;
  heading: string;
  selectIdPrefix: string;
  rowLabelPrefix: string;
  removeRowAriaLabel: string;
  onRemove: () => void;
  removeAriaLabel: string;
  errors?: AddReleaseFormCountriesSubsectionErrors | undefined;
};

const AddReleaseCountriesSection: FC<AddReleaseCountriesSectionProps> = ({
  countries,
  countrySelections,
  onSetCountryCodeName,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
  heading,
  selectIdPrefix,
  rowLabelPrefix,
  removeRowAriaLabel,
  onRemove,
  removeAriaLabel,
  errors,
}) => {
  const propertyErrorMessages = errors?.propertyErrorMessages;

  return (
    <div className={styles.section}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>{heading}</h2>
        <div className={styles.headingRemoveSlot}>
          <button
            type="button"
            className={`${styles.removeCross} ${styles.removeCrossSection}`}
            aria-label={removeAriaLabel}
            title={removeAriaLabel}
            onClick={onRemove}
          >
            <span aria-hidden="true">❌</span>
          </button>
        </div>
      </div>

      <div className={styles.propertyErrors}>
        <FormFieldErrorMessages
          id={`${selectIdPrefix}-property-errors`}
          messages={errorSetToMessages(propertyErrorMessages)}
        />
      </div>

      {countrySelections.map((row, rowIndex) => {
        const rowErrorSet = errors?.countrySelectErrorMessages[row.id];
        const rowErrorMessagesForDisplay =
          rowErrorSet !== undefined && rowErrorSet.size > 0
            ? rowErrorSet
            : undefined;
        const hasRowErrors = rowErrorMessagesForDisplay !== undefined;
        const rowErrorId = `${selectIdPrefix}-row-error-${row.id}`;

        return (
          <div key={row.id} className={styles.inputValueBlock}>
            <div className={styles.segment}>
              <label
                className={styles.labelVisuallyHidden}
                htmlFor={`${selectIdPrefix}-${row.id}`}
              >
                {`${rowLabelPrefix} ${rowIndex + 1}`}
              </label>
              <div className={styles.controlWithRemove}>
                <select
                  id={`${selectIdPrefix}-${row.id}`}
                  className={styles.select}
                  value={row.codeName}
                  aria-invalid={hasRowErrors}
                  aria-describedby={hasRowErrors ? rowErrorId : undefined}
                  onChange={(e) => {
                    onSetCountryCodeName(row.id, e.target.value);
                  }}
                  onFocus={() => onFocus(row.id)}
                  onBlur={onBlur}
                >
                  <option value="">Choose a country…</option>
                  {countries.map((c) => (
                    <option key={c.codeName} value={c.codeName}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className={styles.removeCrossSlot}>
                  {rowIndex > 0 && (
                    <button
                      type="button"
                      className={styles.removeCross}
                      aria-label={removeRowAriaLabel}
                      title={removeRowAriaLabel}
                      onClick={() => {
                        onRemoveRow(row.id);
                      }}
                    >
                      <span aria-hidden="true">❌</span>
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.rowFieldErrors}>
                <FormFieldErrorMessages
                  id={rowErrorId}
                  messages={errorSetToMessages(rowErrorMessagesForDisplay)}
                />
              </div>
            </div>
          </div>
        );
      })}

      <button type="button" className={styles.addAnotherRow} onClick={onAddRow}>
        + Add another country
      </button>
    </div>
  );
};

export default AddReleaseCountriesSection;
