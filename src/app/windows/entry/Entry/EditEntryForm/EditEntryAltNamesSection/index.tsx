import type { FC } from "react";

import styles from "./EditEntryAltNamesSection.module.css";

import type { EditEntryAltNamesErrors } from "../editEntryFormUtils/errorMessages";
import type { EditEntryAltNameRow } from "../editEntryFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";

type EditEntryAltNamesSectionProps = {
  altNames: EditEntryAltNameRow[];
  errors: EditEntryAltNamesErrors;
  onChangeName: (rowId: string, name: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const EditEntryAltNamesSection: FC<EditEntryAltNamesSectionProps> = ({
  altNames,
  errors,
  onChangeName,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <div className={styles.section}>
    <h2 className={styles.heading}>Alternative names</h2>

    {altNames.length > 0 && (
      <ul className={styles.rows} aria-label="Alternative names">
        {altNames.map((row, index) => {
          const rowErrors = errors[row.id];
          const hasErrors = rowErrors && rowErrors.length > 0;
          const errorId = `edit-entry-alt-name-error-${row.id}`;
          const inputId = `edit-entry-alt-name-${row.id}`;

          return (
            <li key={row.id} className={styles.row}>
              <label className={styles.label} htmlFor={inputId}>
                Alt name {index + 1}
              </label>
              <input
                id={inputId}
                className={styles.input}
                type="text"
                value={row.name}
                onChange={(e) => {
                  onChangeName(row.id, e.target.value);
                }}
                onFocus={() => {
                  onFocus(row.id);
                }}
                onBlur={onBlur}
                aria-invalid={hasErrors}
                aria-describedby={hasErrors ? errorId : undefined}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.removeRow}
                onClick={() => {
                  onRemoveRow(row.id);
                }}
              >
                Remove
              </button>
              <FormFieldErrorMessages id={errorId} messages={rowErrors} />
            </li>
          );
        })}
      </ul>
    )}

    <button type="button" className={styles.addRow} onClick={onAddRow}>
      Add alternative name
    </button>
  </div>
);

export default EditEntryAltNamesSection;
