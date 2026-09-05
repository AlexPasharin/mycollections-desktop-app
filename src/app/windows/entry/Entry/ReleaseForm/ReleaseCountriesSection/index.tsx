import type { FC } from "react";

import type { ReleaseFormCountriesSubsectionErrors } from "../releaseFormUtils/errorMessages";
import type { CountrySelectionInput } from "../releaseFormUtils/formValues";

import ErrorMessages from "@/app/components/ErrorMessages";
import type { CountryListItem } from "@/types/countries";
import { errorSetToMessages } from "@/validation";

type ReleaseCountriesSectionProps = {
  countries: CountryListItem[];
  countrySelections: CountrySelectionInput[];
  onSetCountryCodeName: (inputId: string, codeName: string) => void;
  onAddRow: () => void;
  onRemoveRow: (inputId: string) => void;
  onFocus: (inputId: string) => void;
  onBlur: () => void;
  heading: string;
  selectIdPrefix: string;
  rowLabelPrefix: string;
  removeRowAriaLabel: string;
  onRemove: () => void;
  removeAriaLabel: string;
  errors?: ReleaseFormCountriesSubsectionErrors | undefined;
};

const removeCrossClassName =
  "cursor-pointer border-none bg-transparent p-[0.1rem] text-[0.85em] leading-none text-[#1a5fb4] hover:text-[#0d3d82]";

const ReleaseCountriesSection: FC<ReleaseCountriesSectionProps> = ({
  countries,
  countrySelections,
  onSetCountryCodeName,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
  heading,
  selectIdPrefix,
  rowLabelPrefix,
  removeRowAriaLabel,
  onRemove,
  removeAriaLabel,
  errors,
}) => {
  const propertyErrorMessages = errors?.propertyErrorMessages;

  return (
    <div className="mt-0 mb-[0.65rem]">
      <div className="mb-3 flex min-w-0 flex-row flex-nowrap items-center gap-[0.35rem]">
        <h2 className="m-0 min-w-0 flex-[0_1_auto] text-[1em] leading-[1.35] font-semibold">
          {heading}
        </h2>
        <div className="box-border flex w-[1.85rem] flex-[0_0_1.85rem] shrink-0 items-center justify-center">
          <button
            type="button"
            className={`${removeCrossClassName} text-[#c01c28] hover:text-[#9e1420]`}
            aria-label={removeAriaLabel}
            title={removeAriaLabel}
            onClick={onRemove}
          >
            <span aria-hidden="true">❌</span>
          </button>
        </div>
      </div>

      <div className="mb-[0.65rem] max-w-[24rem]">
        <ErrorMessages
          id={`${selectIdPrefix}-property-errors`}
          messages={errorSetToMessages(propertyErrorMessages)}
        />
      </div>

      {countrySelections.map((row, rowIndex) => {
        const rowErrorSet = errors?.countrySelectErrorMessages[row.id];
        const rowErrorMessagesForDisplay =
          rowErrorSet !== undefined && rowErrorSet.size > 0
            ? rowErrorSet
            : undefined;
        const hasRowErrors = rowErrorMessagesForDisplay !== undefined;
        const rowErrorId = `${selectIdPrefix}-row-error-${row.id}`;

        return (
          <div key={row.id} className="mb-[0.95rem]">
            <div className="relative flex w-full max-w-[24rem] min-w-0 flex-col gap-[0.35rem]">
              <label
                className="absolute m-[-1px] h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap [clip-path:inset(50%)]"
                htmlFor={`${selectIdPrefix}-${row.id}`}
              >
                {`${rowLabelPrefix} ${rowIndex + 1}`}
              </label>
              <div className="flex w-full min-w-0 flex-row flex-nowrap items-center gap-[0.35rem]">
                <select
                  id={`${selectIdPrefix}-${row.id}`}
                  className="box-border w-full min-w-0 flex-[1_1_0] px-2 py-[0.35rem] text-[1em]"
                  value={row.codeName}
                  aria-invalid={hasRowErrors}
                  aria-describedby={hasRowErrors ? rowErrorId : undefined}
                  onChange={(e) => {
                    onSetCountryCodeName(row.id, e.target.value);
                  }}
                  onFocus={() => onFocus(row.id)}
                  onBlur={onBlur}
                >
                  <option value="">Choose a country…</option>
                  {countries.map((c) => (
                    <option key={c.codeName} value={c.codeName}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="box-border flex w-[1.85rem] flex-[0_0_1.85rem] shrink-0 items-center justify-center">
                  {rowIndex > 0 && (
                    <button
                      type="button"
                      className={removeCrossClassName}
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
              <div className="mt-1">
                <ErrorMessages
                  id={rowErrorId}
                  messages={errorSetToMessages(rowErrorMessagesForDisplay)}
                />
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="mt-3 cursor-pointer border-none bg-transparent px-0 py-1 text-left text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
        onClick={onAddRow}
      >
        + Add another country
      </button>
    </div>
  );
};

export default ReleaseCountriesSection;
