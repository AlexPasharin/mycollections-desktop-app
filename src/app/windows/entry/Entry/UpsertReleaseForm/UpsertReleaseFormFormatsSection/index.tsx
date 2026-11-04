import { useMemo, type FC } from "react";

import UpsertReleaseFormFormatBlock, {
  type UpsertReleaseFormFormatRowPatch,
} from "./UpsertReleaseFormFormatBlock";

import type { UpsertReleaseFormFormatInputFieldKey } from "../upsertReleaseFormUtils/errorMessages";
import type { UpsertReleaseFormFormatInput } from "../upsertReleaseFormUtils/formValues";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { FormFeedbackMessages } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";

type SetUpsertReleaseFormFormats = (
  stateUpdateFn: (
    prevFormatRows: UpsertReleaseFormFormatInput[],
  ) => UpsertReleaseFormFormatInput[],
) => void;

type UpsertReleaseFormFormatsSectionProps = {
  formatInputs: UpsertReleaseFormFormatInput[];
  releasesFormats: ReleasesFormatListItem[];
  errors: FormFeedbackMessages;
  setFormats: SetUpsertReleaseFormFormats;
  addFormatRow: () => void;
  removeFormatRow: (rowId: string) => void;
  onFieldFocus: (key: UpsertReleaseFormFormatInputFieldKey) => void;
  onBlur: () => void;
};

const UpsertReleaseFormFormatsSection: FC<UpsertReleaseFormFormatsSectionProps> = ({
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

  const patchFormat = (rowId: string, patch: UpsertReleaseFormFormatRowPatch) => {
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

  const hasErrors = errors.length > 0;

  const hasEmptyFormatId = formats.some((row) => row.formatId === "");

  const showAddNewFormatRowButton = !hasErrors && !hasEmptyFormatId;

  return (
    <div className="mt-0 mb-[0.65rem]">
      <h2 className="m-0 mb-3 text-[1em] leading-[1.35] font-semibold">
        Formats
      </h2>

      {formats.map((formatRow, rowIndex) => (
        <div key={formatRow.id}>
          {rowIndex > 0 && (
            <hr
              className="mt-4 mb-3 border-0 border-t border-black/12"
              aria-hidden
            />
          )}
          <div className={rowIndex === 0 ? "pt-0 pb-1" : "pt-2 pb-1"}>
            <UpsertReleaseFormFormatBlock
              row={formatRow}
              rowIndex={rowIndex}
              releasesFormats={releasesFormats}
              formatRowErrors={errors.filter((error) =>
                error.sources?.includes(formatRow.id),
              )}
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
          className="mt-3 cursor-pointer border-none bg-transparent px-0 py-1 text-left text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
          onClick={addFormatRow}
        >
          + Add another format
        </button>
      )}
    </div>
  );
};

export default UpsertReleaseFormFormatsSection;
