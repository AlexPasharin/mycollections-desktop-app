import type { FC } from "react";

import AddReleaseFormFormatBlock, {
  type AddReleaseFormFormatRowPatch,
} from "./AddReleaseFormFormatBlock";
import styles from "./AddReleaseFormFormatsSection.module.css";

import {
  defaultFormatInputRow,
  type AddReleaseFormFormatInput,
  type AddReleaseFormFieldErrors,
  type AddReleaseFormInputFieldKey,
} from "../addReleaseFormUtils";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";

type SetAddReleaseFormFormats = (
  stateUpdateFn: (
    prevFormatRows: AddReleaseFormFormatInput[],
  ) => AddReleaseFormFormatInput[],
) => void;

const FORMATS_SECTION_ERROR_ID = "add-release-formats-section-error";

type AddReleaseFormFormatsSectionProps = {
  formats: AddReleaseFormFormatInput[];
  releasesFormats: ReleasesFormatListItem[];
  formatsFieldError?: AddReleaseFormFieldErrors["formats"];
  setFormats: SetAddReleaseFormFormats;
  onFieldFocus: (key: AddReleaseFormInputFieldKey) => void;
  onBlur: () => void;
};

const AddReleaseFormFormatsSection: FC<AddReleaseFormFormatsSectionProps> = ({
  formats,
  releasesFormats,
  formatsFieldError,
  setFormats,
  onFieldFocus,
  onBlur,
}) => {
  const patchFormat = (rowId: string, patch: AddReleaseFormFormatRowPatch) => {
    setFormats((prevFormatRows) =>
      prevFormatRows.map((formatRow) =>
        formatRow.id === rowId ? { ...formatRow, ...patch } : formatRow,
      ),
    );
  };

  const onFormatChange = (rowId: string, formatId: string) => {
    setFormats((prevFormatRows) => {
      const current = prevFormatRows.find(
        (formatRow) => formatRow.id === rowId,
      );

      if (!current) {
        return prevFormatRows;
      }

      const fmt = releasesFormats.find((f) => f.formatId === formatId);
      const isSevenInch = fmt?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;

      return prevFormatRows.map((formatRow) =>
        formatRow.id === rowId
          ? {
            ...current,
            formatId,
            jukeboxHole: isSevenInch ? current.jukeboxHole : false,
          }
          : formatRow,
      );
    });
  };

  const addFormatRow = () => {
    setFormats((prevFormatRows) => [
      ...prevFormatRows,
      defaultFormatInputRow(),
    ]);
  };

  const removeFormatRow = (rowId: string) => {
    setFormats((prevFormatRows) =>
      prevFormatRows.filter((formatRow) => formatRow.id !== rowId),
    );
  };

  const sectionLevelFormatsErrorMessage =
    formatsFieldError?.message &&
      (!formatsFieldError.source ||
        !formats.some(
          (formatRow) => formatRow.id === formatsFieldError.source?.formatRowId,
        ))
      ? formatsFieldError.message
      : undefined;

  const rowFormatsError = (rowId: string) => {
    if (
      formatsFieldError?.message &&
      formatsFieldError.source?.formatRowId === rowId
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

      {formats.map((formatRow, rowIndex) => {
        const rowErr = rowFormatsError(formatRow.id);

        return (
          <div key={formatRow.id}>
            {rowIndex > 0 && <hr className={styles.divider} aria-hidden />}
            <div
              className={
                rowIndex === 0
                  ? `${styles.formatBlock} ${styles.formatBlockFirst}`
                  : styles.formatBlock
              }
            >
              <AddReleaseFormFormatBlock
                row={formatRow}
                rowIndex={rowIndex}
                releasesFormats={releasesFormats}
                {...(rowErr ? { rowFormatError: rowErr } : {})}
                onFormatChange={(formatId) =>
                  onFormatChange(formatRow.id, formatId)
                }
                patchFormat={(patch) => patchFormat(formatRow.id, patch)}
                onRemoveFormat={
                  rowIndex > 0 ? () => removeFormatRow(formatRow.id) : undefined
                }
                onFieldFocus={onFieldFocus}
                onBlur={onBlur}
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
        onClick={addFormatRow}
      >
        + Add another format
      </button>
    </div>
  );
};

export default AddReleaseFormFormatsSection;
