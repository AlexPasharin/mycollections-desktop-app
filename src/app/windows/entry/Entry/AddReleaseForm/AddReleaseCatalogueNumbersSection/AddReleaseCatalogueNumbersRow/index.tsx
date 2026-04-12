import type { FC } from "react";

import styles from "./AddReleaseCatalogueNumbersRow.module.css";

import type { CatalogueNumberRowState } from "../../addReleaseFormUtils";

import type { LabelListItem } from "@/types/labels";

export type AddReleaseCatalogueNumbersRowProps = {
  row: CatalogueNumberRowState;
  rowIndex: number;
  showDivider: boolean;
  labels: LabelListItem[];
  onAddNewLabelInput: () => void;
  onRemoveLabelInput: (inputValueId: string) => void;
  onSetLabelName: (inputValueId: string, name: string) => void;
  onAddNewCatalogueNumberInput: () => void;
  onRemoveCatalogueNumberInput: (inputValueId: string) => void;
  onSetCatalogueNumber: (inputValueId: string, value: string) => void;
  onRemoveRow?: (() => void) | undefined;
};

const AddReleaseCatalogueNumbersRow: FC<AddReleaseCatalogueNumbersRowProps> = ({
  row,
  rowIndex,
  showDivider,
  labels,
  onAddNewLabelInput,
  onRemoveLabelInput,
  onSetLabelName,
  onAddNewCatalogueNumberInput,
  onRemoveCatalogueNumberInput,
  onSetCatalogueNumber,
  onRemoveRow,
}) => {
  const rowBlockClassName =
    rowIndex === 0
      ? `${styles.rowBlock} ${styles.rowBlockFirst}`
      : styles.rowBlock;

  const canRemoveAnyInput =
    row.labelInputValues.length + row.catalogueNumberInputValues.length > 1;

  return (
    <>
      {showDivider && <hr className={styles.divider} aria-hidden />}
      <div className={rowBlockClassName}>
        <div role="group" aria-label={`Catalogue numbers ${rowIndex + 1}`}>
          <div className={styles.rowColumns}>
            <div className={styles.column}>
              {row.labelInputValues.map((inputValue) => (
                <div key={inputValue.id} className={styles.inputValueBlock}>
                  <div className={styles.segment}>
                    <label
                      className={styles.label}
                      htmlFor={`add-release-cat-label-${row.id}-${inputValue.id}`}
                    >
                      Label
                    </label>
                    <div className={styles.controlWithRemove}>
                      <select
                        id={`add-release-cat-label-${row.id}-${inputValue.id}`}
                        className={styles.input}
                        value={inputValue.name}
                        onChange={(e) =>
                          onSetLabelName(inputValue.id, e.target.value)
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
                        className={styles.removeCrossInputValue}
                        aria-hidden={canRemoveAnyInput ? undefined : true}
                      >
                        {canRemoveAnyInput ? (
                          <button
                            type="button"
                            className={styles.removeCross}
                            aria-label="Remove label"
                            title="Remove label"
                            onClick={() => onRemoveLabelInput(inputValue.id)}
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
                  className={styles.addAnotherInputValue}
                  onClick={onAddNewLabelInput}
                >
                  + Add another label
                </button>
              </div>
            </div>

            <div className={styles.column}>
              {row.catalogueNumberInputValues.map((inputValue) => (
                <div key={inputValue.id} className={styles.inputValueBlock}>
                  <div className={styles.segment}>
                    <label
                      className={styles.label}
                      htmlFor={`add-release-cat-number-${row.id}-${inputValue.id}`}
                    >
                      Catalogue number
                    </label>
                    <div className={styles.controlWithRemove}>
                      <input
                        id={`add-release-cat-number-${row.id}-${inputValue.id}`}
                        className={styles.input}
                        type="text"
                        value={inputValue.value}
                        onChange={(e) =>
                          onSetCatalogueNumber(inputValue.id, e.target.value)
                        }
                        autoComplete="off"
                      />
                      <div
                        className={styles.removeCrossInputValue}
                        aria-hidden={canRemoveAnyInput ? undefined : true}
                      >
                        {canRemoveAnyInput ? (
                          <button
                            type="button"
                            className={styles.removeCross}
                            aria-label="Remove catalogue number"
                            title="Remove catalogue number"
                            onClick={() =>
                              onRemoveCatalogueNumberInput(inputValue.id)
                            }
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
                  className={styles.addAnotherInputValue}
                  onClick={onAddNewCatalogueNumberInput}
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
