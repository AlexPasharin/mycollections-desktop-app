import type { FC } from "react";

import styles from "./AddReleaseCountriesSection.module.css";

import type { CountrySelectionInput } from "../addReleaseFormUtils";

import type { CountryListItem } from "@/types/countries";

type AddReleaseCountriesSectionProps = {
  countries: CountryListItem[];
  countrySelections: CountrySelectionInput[];
  onSetCountryCodeName: (inputId: string, codeName: string) => void;
  onAddRow: () => void;
  onRemoveRow: (inputId: string) => void;
  heading: string;
  selectIdPrefix: string;
  rowLabelPrefix: string;
  removeRowAriaLabel: string;
  onRemove: () => void;
  removeAriaLabel: string;
};

const AddReleaseCountriesSection: FC<AddReleaseCountriesSectionProps> = ({
  countries,
  countrySelections,
  onSetCountryCodeName,
  onAddRow,
  onRemoveRow,
  heading,
  selectIdPrefix,
  rowLabelPrefix,
  removeRowAriaLabel,
  onRemove,
  removeAriaLabel,
}) => {
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

      {countrySelections.map((row, rowIndex) => (
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
                onChange={(e) => {
                  onSetCountryCodeName(row.id, e.target.value);
                }}
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
          </div>
        </div>
      ))}

      <button type="button" className={styles.addAnotherRow} onClick={onAddRow}>
        + Add another country
      </button>
    </div>
  );
};

export default AddReleaseCountriesSection;
