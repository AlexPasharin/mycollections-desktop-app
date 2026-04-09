import type { FC } from "react";

import AddReleaseFormFormatBlock from "./AddReleaseFormFormatBlock";
import styles from "./AddReleaseFormFormatsSection.module.css";

import type {
  FieldErrorsDict,
  FieldValidationKey,
} from "../addReleaseFormUtils";

import type { ReleasesFormatListItem } from "@/types/formats";

export type AddReleaseFormFormatInput = {
  id: string;
  formatId: string;
  shortName: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

export type AddReleaseFormFormatRowPatch = Partial<
  Omit<AddReleaseFormFormatInput, "id">
>;

const FORMATS_SECTION_ERROR_ID = "add-release-formats-section-error";

type AddReleaseFormFormatsSectionProps = {
  formats: AddReleaseFormFormatInput[];
  releasesFormats: ReleasesFormatListItem[];
  formatsFieldError?: FieldErrorsDict["formats"];
  onFormatChange: (rowId: string, formatId: string) => void;
  patchFormat: (rowId: string, patch: AddReleaseFormFormatRowPatch) => void;
  onAddFormat: () => void;
  onRemoveFormat: (rowId: string) => void;
  onFieldFocus: (key: FieldValidationKey) => void;
  onFieldBlur: (key: FieldValidationKey) => void;
};

const AddReleaseFormFormatsSection: FC<AddReleaseFormFormatsSectionProps> = ({
  formats,
  releasesFormats,
  formatsFieldError,
  onFormatChange,
  patchFormat,
  onAddFormat,
  onRemoveFormat,
  onFieldFocus,
  onFieldBlur,
}) => {
  const sectionLevelFormatsErrorMessage =
    formatsFieldError?.message &&
    (!formatsFieldError.source ||
      !formats.some((r) => r.id === formatsFieldError.source?.rowId))
      ? formatsFieldError.message
      : undefined;

  const rowFormatsError = (rowId: string) => {
    if (
      formatsFieldError?.message &&
      formatsFieldError.source?.rowId === rowId
    ) {
      return {
        message: formatsFieldError.message,
        field: formatsFieldError.source.field,
      };
    }

    return undefined;
  };

  return (
    <div
      className={styles.section}
      role="group"
      aria-labelledby="add-release-formats-heading"
      aria-describedby={
        sectionLevelFormatsErrorMessage ? FORMATS_SECTION_ERROR_ID : undefined
      }
    >
      <p id="add-release-formats-heading" className={styles.heading}>
        Formats
      </p>

      {formats.map((row, rowIndex) => {
        const rowErr = rowFormatsError(row.id);

        return (
          <div key={row.id}>
            {rowIndex > 0 && <hr className={styles.divider} aria-hidden />}
            <div
              className={
                rowIndex === 0
                  ? `${styles.formatBlock} ${styles.formatBlockFirst}`
                  : styles.formatBlock
              }
            >
              <AddReleaseFormFormatBlock
                row={row}
                rowIndex={rowIndex}
                releasesFormats={releasesFormats}
                {...(rowErr ? { rowFormatError: rowErr } : {})}
                onFormatChange={(formatId) => onFormatChange(row.id, formatId)}
                patchFormat={(patch) => patchFormat(row.id, patch)}
                onRemoveFormat={
                  rowIndex > 0 ? () => onRemoveFormat(row.id) : undefined
                }
                onFieldFocus={onFieldFocus}
                onFieldBlur={onFieldBlur}
              />
            </div>
          </div>
        );
      })}

      {sectionLevelFormatsErrorMessage && (
        <p
          id={FORMATS_SECTION_ERROR_ID}
          className={styles.fieldError}
          role="alert"
        >
          {sectionLevelFormatsErrorMessage}
        </p>
      )}

      <button
        type="button"
        id="add-release-add-another-format"
        className={styles.addAnotherFormat}
        onClick={onAddFormat}
      >
        + Add another format
      </button>
    </div>
  );
};

export default AddReleaseFormFormatsSection;
