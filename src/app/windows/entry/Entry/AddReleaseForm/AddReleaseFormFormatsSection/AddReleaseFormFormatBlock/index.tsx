import type { FC } from "react";

import styles from "./AddReleaseFormFormatBlock.module.css";

import type {
  AddReleaseFormFormatInput,
  FormatFieldErrorSource,
  FormatFieldKind,
  FieldValidationKey,
} from "../../addReleaseFormUtils";
import type { AddReleaseFormFormatRowPatch } from "../index";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";

type RowFormatError = {
  message: string;
  field: FormatFieldKind;
};

type AddReleaseFormFormatBlockProps = {
  row: AddReleaseFormFormatInput;
  rowIndex: number;
  releasesFormats: ReleasesFormatListItem[];
  rowFormatError?: RowFormatError;
  onFormatChange: (formatId: string) => void;
  patchFormat: (patch: AddReleaseFormFormatRowPatch) => void;
  onRemoveFormat?: (() => void) | undefined;
  onFieldFocus: (key: FieldValidationKey) => void;
  onFieldBlur: (key: FieldValidationKey) => void;
};

const formatFieldSource = (
  rowId: string,
  field: FormatFieldKind,
): FormatFieldErrorSource => ({ rowId, field });

const AddReleaseFormFormatBlock: FC<AddReleaseFormFormatBlockProps> = ({
  row,
  rowIndex,
  releasesFormats,
  rowFormatError,
  onFormatChange,
  patchFormat,
  onRemoveFormat,
  onFieldFocus,
  onFieldBlur,
}) => {
  const rowErrorElementId = `add-release-formats-row-error-${row.id}`;
  const invalidField = rowFormatError?.field;

  const selectedFormat = releasesFormats.find(
    (f) => f.formatId === row.formatId,
  );
  const showJukeboxHole =
    selectedFormat?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;
  const formatSectionDisabled = !row.formatId;
  const suffix = `-${row.id}`;

  return (
    <div role="group" aria-label={`Format ${rowIndex + 1}`}>
      <div className={styles.inlineRow}>
        <div className={styles.segment}>
          <label
            className={styles.label}
            htmlFor={`add-release-format${suffix}`}
          >
            Format
          </label>
          <select
            id={`add-release-format${suffix}`}
            className={styles.input}
            value={row.formatId}
            aria-invalid={invalidField === "format"}
            aria-describedby={
              invalidField === "format" ? rowErrorElementId : undefined
            }
            onChange={(e) => onFormatChange(e.target.value)}
            onFocus={() => onFieldFocus(formatFieldSource(row.id, "format"))}
            onBlur={() => onFieldBlur(formatFieldSource(row.id, "format"))}
          >
            <option value="" />
            {releasesFormats.map((f) => (
              <option key={f.formatId} value={f.formatId}>
                {f.shortName}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.segmentAmount}>
          <label
            className={styles.label}
            htmlFor={`add-release-format-amount${suffix}`}
          >
            Amount
          </label>
          <input
            id={`add-release-format-amount${suffix}`}
            className={styles.input}
            type="number"
            min={1}
            step={1}
            value={row.amount}
            disabled={formatSectionDisabled}
            aria-invalid={invalidField === "amount"}
            aria-describedby={
              invalidField === "amount" ? rowErrorElementId : undefined
            }
            onChange={(e) => patchFormat({ amount: e.target.value })}
            onFocus={() => onFieldFocus(formatFieldSource(row.id, "amount"))}
            onBlur={() => onFieldBlur(formatFieldSource(row.id, "amount"))}
          />
        </div>
      </div>

      <div className={styles.checkboxesRow}>
        <div className={styles.checkboxRow}>
          <input
            id={`add-release-picture-sleeve${suffix}`}
            type="checkbox"
            checked={row.pictureSleeve}
            disabled={formatSectionDisabled}
            aria-invalid={invalidField === "pictureSleeve"}
            aria-describedby={
              invalidField === "pictureSleeve" ? rowErrorElementId : undefined
            }
            onChange={(e) => patchFormat({ pictureSleeve: e.target.checked })}
            onFocus={() =>
              onFieldFocus(formatFieldSource(row.id, "pictureSleeve"))
            }
            onBlur={() =>
              onFieldBlur(formatFieldSource(row.id, "pictureSleeve"))
            }
          />
          <label
            className={styles.checkboxLabel}
            htmlFor={`add-release-picture-sleeve${suffix}`}
          >
            Picture sleeve
          </label>
        </div>
        {showJukeboxHole && (
          <div className={styles.checkboxRow}>
            <input
              id={`add-release-jukebox-hole${suffix}`}
              type="checkbox"
              checked={row.jukeboxHole}
              aria-invalid={invalidField === "jukeboxHole"}
              aria-describedby={
                invalidField === "jukeboxHole" ? rowErrorElementId : undefined
              }
              onChange={(e) => patchFormat({ jukeboxHole: e.target.checked })}
              onFocus={() =>
                onFieldFocus(formatFieldSource(row.id, "jukeboxHole"))
              }
              onBlur={() =>
                onFieldBlur(formatFieldSource(row.id, "jukeboxHole"))
              }
            />
            <label
              className={styles.checkboxLabel}
              htmlFor={`add-release-jukebox-hole${suffix}`}
            >
              Jukebox hole
            </label>
          </div>
        )}
      </div>

      {rowFormatError && (
        <p id={rowErrorElementId} className={styles.fieldError} role="alert">
          {rowFormatError.message}
        </p>
      )}

      {onRemoveFormat && (
        <div className={styles.removeRow}>
          <button
            type="button"
            className={styles.removeFormat}
            id={`add-release-remove-format${suffix}`}
            aria-label={`Remove format ${rowIndex + 1}`}
            onClick={onRemoveFormat}
          >
            Remove format
          </button>
        </div>
      )}
    </div>
  );
};

export default AddReleaseFormFormatBlock;
