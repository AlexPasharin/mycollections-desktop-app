import type { FC } from "react";

import type { EntryTypeListItem } from "@/types/entryTypes";

type UpsertEntryTypesSectionProps = {
  allEntryTypes: EntryTypeListItem[];
  selectedTypeIds: Set<string>;
  onAddType: (entryTypeId: string) => void;
  onRemoveType: (entryTypeId: string) => void;
};

const UpsertEntryTypesSection: FC<UpsertEntryTypesSectionProps> = ({
  allEntryTypes,
  selectedTypeIds,
  onAddType,
  onRemoveType,
}) => {
  const [selectedTypes, availableTypes] = allEntryTypes.reduce<
    [EntryTypeListItem[], EntryTypeListItem[]]
  >(
    (acc, entryType) => {
      const idx = selectedTypeIds.has(entryType.entryTypeId) ? 0 : 1;
      acc[idx].push(entryType);

      return acc;
    },
    [[], []],
  );

  return (
    <div className="mt-0 mb-[0.65rem]">
      <h2 className="mb-3 text-base leading-snug font-semibold">Types</h2>

      {selectedTypes.length > 0 && (
        <ul
          className="mb-3 flex list-none flex-wrap gap-[0.4rem] p-0"
          aria-label="Selected types"
        >
          {selectedTypes.map((entryType) => (
            <li
              key={entryType.entryTypeId}
              className="inline-flex items-center gap-[0.35rem] rounded bg-black/5 px-2 py-1 text-[0.92em]"
            >
              <span>{entryType.name}</span>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent px-[0.35rem] py-[0.1rem] text-[0.85em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
                onClick={() => {
                  onRemoveType(entryType.entryTypeId);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
        <label
          className="text-[0.92em] font-semibold"
          htmlFor="upsert-entry-type-select"
        >
          Add type
        </label>
        <select
          id="upsert-entry-type-select"
          className="box-border w-full max-w-96 px-2 py-[0.35rem] text-base"
          value=""
          onChange={(e) => {
            const { value } = e.target;

            if (value) {
              onAddType(value);
            }
          }}
        >
          <option value="">Choose a type…</option>
          {availableTypes.map((entryType) => (
            <option key={entryType.entryTypeId} value={entryType.entryTypeId}>
              {entryType.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UpsertEntryTypesSection;
