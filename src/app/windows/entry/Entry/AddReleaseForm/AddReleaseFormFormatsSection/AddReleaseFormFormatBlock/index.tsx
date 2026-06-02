import type { FC } from "react";

import styles from "./AddReleaseFormFormatBlock.module.css";

import type {
  FormatField,
  AddReleaseFormFormatInputFieldKey,
} from "../../addReleaseFormUtils/errorMessages";
import type { AddReleaseFormFormatInput } from "../../addReleaseFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { FormFieldError } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";

export type AddReleaseFormFormatRowPatch = Partial<
  Omit<AddReleaseFormFormatInput, "id" | "shortName" | "formatId">
>;

type AddReleaseFormFormatBlockProps = {
  row: AddReleaseFormFormatInput;
  rowIndex: number;
  releasesFormats: ReleasesFormatListItem[];
  formatRowErrors?: FormFieldError[] | undefined;
  onFormatChange: (formatId: string) => void;
  patchFormat: (patch: AddReleaseFormFormatRowPatch) => void;
  onRemoveFormat?: (() => void) | undefined;
  onFieldFocus: (key: AddReleaseFormFormatInputFieldKey) => void;
  onBlur: () => void;
};

const formatFieldSource = (rowId: string, field: FormatField) => ({
  formatRowId: rowId,
  field,
});

const AddReleaseFormFormatBlock: FC<AddReleaseFormFormatBlockProps> = ({
  row,
  rowIndex,
  releasesFormats,
  formatRowErrors,
  onFormatChange,
  patchFormat,
  onRemoveFormat,
  onFieldFocus,
  onBlur,
}) => {
  const rowErrorElementId = `add-release-formats-row-error-${row.id}`;

  const selectedFormat = releasesFormats.find(
    (f) => f.formatId === row.formatId,
  );
  const showJukeboxHole =
    selectedFormat?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;
  const formatSectionDisabled = !row.formatId;
  const suffix = `-${row.id}`;

  const fieldInvalid = (field: FormatField) =>
    formatRowErrors?.some((e) => e.sources?.includes(field)) ?? false;

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
            aria-invalid={fieldInvalid("formatId")}
            aria-describedby={
              fieldInvalid("formatId") ? rowErrorElementId : undefined
            }
            onChange={(e) => onFormatChange(e.target.value)}
            onFocus={() => onFieldFocus(formatFieldSource(row.id, "formatId"))}
            onBlur={onBlur}
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
            aria-invalid={fieldInvalid("amount")}
            aria-describedby={
              fieldInvalid("amount") ? rowErrorElementId : undefined
            }
            onChange={(e) => patchFormat({ amount: e.target.value })}
            onFocus={() => onFieldFocus(formatFieldSource(row.id, "amount"))}
            onBlur={onBlur}
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
            aria-invalid={fieldInvalid("pictureSleeve")}
            aria-describedby={
              fieldInvalid("pictureSleeve") ? rowErrorElementId : undefined
            }
            onChange={(e) => patchFormat({ pictureSleeve: e.target.checked })}
            onFocus={() =>
              onFieldFocus(formatFieldSource(row.id, "pictureSleeve"))
            }
            onBlur={onBlur}
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
              aria-invalid={fieldInvalid("jukeboxHole")}
              aria-describedby={
                fieldInvalid("jukeboxHole") ? rowErrorElementId : undefined
              }
              onChange={(e) => patchFormat({ jukeboxHole: e.target.checked })}
              onFocus={() =>
                onFieldFocus(formatFieldSource(row.id, "jukeboxHole"))
              }
              onBlur={onBlur}
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

      {formatRowErrors && (
        <FormFieldErrorMessages
          id={rowErrorElementId}
          messages={formatRowErrors}
        />
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
