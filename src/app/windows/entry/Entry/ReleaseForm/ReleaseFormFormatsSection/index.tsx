import { useMemo, type FC } from "react";

import ReleaseFormFormatBlock, {
  type ReleaseFormFormatRowPatch,
} from "./ReleaseFormFormatBlock";
import styles from "./ReleaseFormFormatsSection.module.css";

import type {
  ReleaseFormFormatErrors,
  ReleaseFormFormatInputFieldKey,
} from "../releaseFormUtils/errorMessages";
import type { ReleaseFormFormatInput } from "../releaseFormUtils/formValues";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";

type SetReleaseFormFormats = (
  stateUpdateFn: (
    prevFormatRows: ReleaseFormFormatInput[],
  ) => ReleaseFormFormatInput[],
) => void;

type ReleaseFormFormatsSectionProps = {
  formatInputs: ReleaseFormFormatInput[];
  releasesFormats: ReleasesFormatListItem[];
  errors: ReleaseFormFormatErrors;
  setFormats: SetReleaseFormFormats;
  addFormatRow: () => void;
  removeFormatRow: (rowId: string) => void;
  onFieldFocus: (key: ReleaseFormFormatInputFieldKey) => void;
  onBlur: () => void;
};

const ReleaseFormFormatsSection: FC<ReleaseFormFormatsSectionProps> = ({
  formatInputs: formats,
  releasesFormats,
  errors,
  setFormats,
  addFormatRow,
  removeFormatRow,
  onFieldFocus,
  onBlur,
}) => {
  const sevenInchFormatId = useMemo(
    () =>
      releasesFormats.find((f) => f.shortName === SEVEN_INCH_FORMAT_SHORT_NAME)
        ?.formatId,
    [releasesFormats],
  );

  const patchFormat = (rowId: string, patch: ReleaseFormFormatRowPatch) => {
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

      const isSevenInch = formatId === sevenInchFormatId;

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

  const hasErrors = Object.values(errors).some(
    (rowErrors) => rowErrors.length > 0,
  );

  const hasEmptyFormatId = formats.some((row) => row.formatId === "");

  const showAddNewFormatRowButton = !hasErrors && !hasEmptyFormatId;

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Formats</h2>

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
            <ReleaseFormFormatBlock
              row={formatRow}
              rowIndex={rowIndex}
              releasesFormats={releasesFormats}
              formatRowErrors={errors[formatRow.id]}
              onFormatChange={(formatId) =>
                onFormatChange(formatRow.id, formatId)
              }
              patchFormat={(patch) => patchFormat(formatRow.id, patch)}
              onRemoveFormat={() => removeFormatRow(formatRow.id)}
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

export default ReleaseFormFormatsSection;
