import type { FC } from "react";

import styles from "./EditEntryTypesSection.module.css";

import type { EntryTypeListItem } from "@/types/entryTypes";

type EditEntryTypesSectionProps = {
  allEntryTypes: EntryTypeListItem[];
  selectedTypeIds: Set<string>;
  onAddType: (entryTypeId: string) => void;
  onRemoveType: (entryTypeId: string) => void;
};

const EditEntryTypesSection: FC<EditEntryTypesSectionProps> = ({
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
    <div className={styles.section}>
      <h2 className={styles.heading}>Types</h2>

      {selectedTypes.length > 0 && (
        <ul className={styles.selectedList} aria-label="Selected types">
          {selectedTypes.map((entryType) => (
            <li key={entryType.entryTypeId} className={styles.selectedItem}>
              <span>{entryType.name}</span>
              <button
                type="button"
                className={styles.removeType}
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

      <div className={styles.field}>
        <label className={styles.label} htmlFor="edit-entry-type-select">
          Add type
        </label>
        <select
          id="edit-entry-type-select"
          className={styles.select}
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

export default EditEntryTypesSection;
