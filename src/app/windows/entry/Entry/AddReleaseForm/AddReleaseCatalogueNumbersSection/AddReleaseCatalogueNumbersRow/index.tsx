import type { FC } from "react";

import styles from "./AddReleaseCatalogueNumbersRow.module.css";

import type { CatalogueNumberRowState } from "../catalogueNumbersRowState";

import type { LabelListItem } from "@/types/labels";

export type AddReleaseCatalogueNumbersRowProps = {
  row: CatalogueNumberRowState;
  rowIndex: number;
  showDivider: boolean;
  labels: LabelListItem[];
  onAddLabelSlot: () => void;
  onRemoveLabelSlot: (slotId: string) => void;
  onSetLabelSlotName: (slotId: string, name: string) => void;
  onAddCatalogueNumberSlot: () => void;
  onRemoveCatalogueNumberSlot: (slotId: string) => void;
  onSetCatalogueNumberSlotValue: (slotId: string, value: string) => void;
  onRemoveRow?: (() => void) | undefined;
};

const AddReleaseCatalogueNumbersRow: FC<AddReleaseCatalogueNumbersRowProps> = ({
  row,
  rowIndex,
  showDivider,
  labels,
  onAddLabelSlot,
  onRemoveLabelSlot,
  onSetLabelSlotName,
  onAddCatalogueNumberSlot,
  onRemoveCatalogueNumberSlot,
  onSetCatalogueNumberSlotValue,
  onRemoveRow,
}) => {
  const rowBlockClassName =
    rowIndex === 0
      ? `${styles.rowBlock} ${styles.rowBlockFirst}`
      : styles.rowBlock;

  return (
    <>
      {showDivider && <hr className={styles.divider} aria-hidden />}
      <div className={rowBlockClassName}>
        <div role="group" aria-label={`Catalogue numbers ${rowIndex + 1}`}>
          <div className={styles.rowColumns}>
            <div className={styles.column}>
              {row.labelSlots.map((slot, slotIndex) => (
                <div key={slot.id} className={styles.slotBlock}>
                  <div className={styles.segment}>
                    <label
                      className={styles.label}
                      htmlFor={`add-release-cat-label-${row.id}-${slot.id}`}
                    >
                      Label
                    </label>
                    <div className={styles.controlWithRemove}>
                      <select
                        id={`add-release-cat-label-${row.id}-${slot.id}`}
                        className={styles.input}
                        value={slot.name}
                        onChange={(e) =>
                          onSetLabelSlotName(slot.id, e.target.value)
                        }
                      >
                        <option value="" />
                        {labels.map((label) => (
                          <option key={label.labelId} value={label.name}>
                            {label.name}
                          </option>
                        ))}
                      </select>
                      <div
                        className={styles.removeCrossSlot}
                        aria-hidden={slotIndex === 0 ? true : undefined}
                      >
                        {slotIndex > 0 ? (
                          <button
                            type="button"
                            className={styles.removeCross}
                            aria-label="Remove label"
                            title="Remove label"
                            onClick={() => onRemoveLabelSlot(slot.id)}
                          >
                            <span aria-hidden="true">❌</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.addAnotherSlot}
                  onClick={onAddLabelSlot}
                >
                  + Add another label
                </button>
              </div>
            </div>

            <div className={styles.column}>
              {row.catalogueNumberSlots.map((slot, slotIndex) => (
                <div key={slot.id} className={styles.slotBlock}>
                  <div className={styles.segment}>
                    <label
                      className={styles.label}
                      htmlFor={`add-release-cat-number-${row.id}-${slot.id}`}
                    >
                      Catalogue number
                    </label>
                    <div className={styles.controlWithRemove}>
                      <input
                        id={`add-release-cat-number-${row.id}-${slot.id}`}
                        className={styles.input}
                        type="text"
                        value={slot.value}
                        onChange={(e) =>
                          onSetCatalogueNumberSlotValue(slot.id, e.target.value)
                        }
                        autoComplete="off"
                      />
                      <div
                        className={styles.removeCrossSlot}
                        aria-hidden={slotIndex === 0 ? true : undefined}
                      >
                        {slotIndex > 0 ? (
                          <button
                            type="button"
                            className={styles.removeCross}
                            aria-label="Remove catalogue number"
                            title="Remove catalogue number"
                            onClick={() => onRemoveCatalogueNumberSlot(slot.id)}
                          >
                            <span aria-hidden="true">❌</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.addAnotherSlot}
                  onClick={onAddCatalogueNumberSlot}
                >
                  + Add another catalogue number
                </button>
              </div>
            </div>
          </div>
        </div>

        {onRemoveRow && (
          <div className={styles.removeRow}>
            <button
              type="button"
              className={styles.removeRowButton}
              aria-label={`Remove catalogue numbers row ${rowIndex + 1}`}
              onClick={onRemoveRow}
            >
              Remove catalogue row
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AddReleaseCatalogueNumbersRow;
