import type { FC } from "react";

import type { UpsertEntryAltNamesErrors } from "../upsertEntryFormUtils/errorMessages";
import type { UpsertEntryAltNameRow } from "../upsertEntryFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";

type UpsertEntryAltNamesSectionProps = {
  altNames: UpsertEntryAltNameRow[];
  errors: UpsertEntryAltNamesErrors;
  onChangeName: (rowId: string, name: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const UpsertEntryAltNamesSection: FC<UpsertEntryAltNamesSectionProps> = ({
  altNames,
  errors,
  onChangeName,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <div className="mt-0 mb-[0.65rem]">
    <h2 className="mb-3 text-base leading-snug font-semibold">
      Alternative names
    </h2>

    {altNames.length > 0 && (
      <ul
        className="mb-3 flex flex-col gap-[0.55rem]"
        aria-label="Alternative names"
      >
        {altNames.map((row, index) => {
          const rowErrors = errors[row.id];
          const hasErrors = rowErrors && rowErrors.length > 0;
          const errorId = `upsert-entry-alt-name-error-${row.id}`;
          const inputId = `upsert-entry-alt-name-${row.id}`;

          return (
            <li key={row.id} className="flex flex-wrap items-start gap-2">
              <label
                className="min-w-28 pt-[0.35rem] text-[0.92em] font-semibold"
                htmlFor={inputId}
              >
                Alt name {index + 1}
              </label>
              <input
                id={inputId}
                className="min-w-40 flex-[1_1_14rem] px-2 py-[0.35rem] text-base"
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
                className="cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.6rem] py-[0.35rem] text-[0.92em] text-[#333] hover:bg-[#f1f1f1]"
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

    <button
      type="button"
      className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
      onClick={onAddRow}
    >
      Add alternative name
    </button>
  </div>
);

export default UpsertEntryAltNamesSection;
