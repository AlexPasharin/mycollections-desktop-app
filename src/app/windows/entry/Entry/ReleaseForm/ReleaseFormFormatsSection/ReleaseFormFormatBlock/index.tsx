import type { FC } from "react";

import type {
  FormatField,
  ReleaseFormFormatInputFieldKey,
} from "../../releaseFormUtils/errorMessages";
import type { ReleaseFormFormatInput } from "../../releaseFormUtils/formValues";

import ErrorMessages from "@/app/components/ErrorMessages";
import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { FormFieldError } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";

export type ReleaseFormFormatRowPatch = Partial<
  Omit<ReleaseFormFormatInput, "id" | "shortName" | "formatId">
>;

type ReleaseFormFormatBlockProps = {
  row: ReleaseFormFormatInput;
  rowIndex: number;
  releasesFormats: ReleasesFormatListItem[];
  formatRowErrors?: FormFieldError[] | undefined;
  onFormatChange: (formatId: string) => void;
  patchFormat: (patch: ReleaseFormFormatRowPatch) => void;
  onRemoveFormat: () => void;
  onFieldFocus: (key: ReleaseFormFormatInputFieldKey) => void;
  onBlur: () => void;
};

const labelClassName = "text-[0.92em] font-semibold";
const inputClassName = "box-border w-full min-w-0 px-2 py-[0.35rem] text-[1em]";
const checkboxRowClassName = "flex flex-row items-center gap-2";
const checkboxLabelClassName = "m-0 text-[0.92em] font-medium";

const formatFieldSource = (rowId: string, field: FormatField) => ({
  formatRowId: rowId,
  field,
});

const ReleaseFormFormatBlock: FC<ReleaseFormFormatBlockProps> = ({
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
      <div className="mb-[0.65rem] flex w-full min-w-0 flex-row flex-nowrap items-end gap-[0.65rem]">
        <div className="flex min-w-0 flex-[1_1_0] flex-col gap-[0.35rem]">
          <label
            className={labelClassName}
            htmlFor={`add-release-format${suffix}`}
          >
            Format
          </label>
          <select
            id={`add-release-format${suffix}`}
            className={inputClassName}
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
        <div className="flex w-[5.5rem] shrink-0 flex-col gap-[0.35rem]">
          <label
            className={labelClassName}
            htmlFor={`add-release-format-amount${suffix}`}
          >
            Amount
          </label>
          <input
            id={`add-release-format-amount${suffix}`}
            className={inputClassName}
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

      <div className="flex flex-row flex-wrap items-center gap-4">
        <div className={checkboxRowClassName}>
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
            className={checkboxLabelClassName}
            htmlFor={`add-release-picture-sleeve${suffix}`}
          >
            Picture sleeve
          </label>
        </div>
        {showJukeboxHole && (
          <div className={checkboxRowClassName}>
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
              className={checkboxLabelClassName}
              htmlFor={`add-release-jukebox-hole${suffix}`}
            >
              Jukebox hole
            </label>
          </div>
        )}
      </div>

      <ErrorMessages id={rowErrorElementId} messages={formatRowErrors} />

      <div className="mt-2">
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent px-0 py-1 text-left text-[0.92em] text-[#a40000] underline hover:text-[#7a0000]"
          id={`add-release-remove-format${suffix}`}
          aria-label={`Remove format ${rowIndex + 1}`}
          onClick={onRemoveFormat}
        >
          Remove format
        </button>
      </div>
    </div>
  );
};

export default ReleaseFormFormatBlock;
