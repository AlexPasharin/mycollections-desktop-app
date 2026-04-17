import type { FC } from "react";

import AddReleaseFormFormatBlock, {
  type AddReleaseFormFormatRowPatch,
} from "./AddReleaseFormFormatBlock";
import styles from "./AddReleaseFormFormatsSection.module.css";

import type {
  AddReleaseFormFormatInput,
  AddReleaseFormFieldErrors,
  AddReleaseFormFormatInputFieldKey,
} from "../addReleaseFormUtils";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";

type SetAddReleaseFormFormats = (
  stateUpdateFn: (
    prevFormatRows: AddReleaseFormFormatInput[],
  ) => AddReleaseFormFormatInput[],
) => void;

type AddReleaseFormFormatsSectionProps = {
  formats: AddReleaseFormFormatInput[];
  releasesFormats: ReleasesFormatListItem[];
  errors?: AddReleaseFormFieldErrors["formats"];
  setFormats: SetAddReleaseFormFormats;
  addFormatRow: () => void;
  removeFormatRow: (rowId: string) => void;
  onFieldFocus: (key: AddReleaseFormFormatInputFieldKey) => void;
  onBlur: () => void;
};

const AddReleaseFormFormatsSection: FC<AddReleaseFormFormatsSectionProps> = ({
  formats,
  releasesFormats,
  errors,
  setFormats,
  addFormatRow,
  removeFormatRow,
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

      const shortName = fmt?.shortName ?? "";

      const isSevenInch = shortName === SEVEN_INCH_FORMAT_SHORT_NAME;

      return prevFormatRows.map((formatRow) =>
        formatRow.id === rowId
          ? {
              ...current,
              formatId,
              shortName,
              jukeboxHole: isSevenInch ? current.jukeboxHole : false,
            }
          : formatRow,
      );
    });
  };

  const hasErrors =
    errors !== undefined &&
    Object.values(errors).some(
      (rowErrors) => rowErrors && rowErrors.length > 0,
    );

  const hasEmptyFormatId = formats.some((row) => row.formatId === "");

  const showAddNewFormatRowButton = !hasErrors && !hasEmptyFormatId;

  return (
    <div className={styles.section}>
      <p className={styles.heading}>Formats</p>

      {formats.map((formatRow, rowIndex) => (
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
              formatRowErrors={errors?.[formatRow.id]}
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
      ))}

      {showAddNewFormatRowButton && (
        <button
          type="button"
          id="add-release-add-another-format"
          className={styles.addAnotherFormat}
          onClick={addFormatRow}
        >
          + Add another format
        </button>
      )}
    </div>
  );
};

export default AddReleaseFormFormatsSection;
