import type { FC } from "react";

import styles from "./AddReleaseCatalogueNumbersRow.module.css";

import type {
  AddReleaseFormCatalogueNumberRowErrors,
  AddReleaseFormCatalogueNumbersInputFieldKey,
  CatalogueNumbersInputField,
} from "../../addReleaseFormUtils/errorMessages";
import type { CatalogueNumberRowState } from "../../addReleaseFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import type { LabelListItem } from "@/types/labels";

export type AddReleaseCatalogueNumbersRowProps = {
  row: CatalogueNumberRowState;
  rowIndex: number;
  showDivider: boolean;
  labels: LabelListItem[];
  catNumberSectionValuesAreInvalid: boolean;
  rowErrors?: AddReleaseFormCatalogueNumberRowErrors | undefined;
  onAddNewLabelInput: () => void;
  onRemoveLabelInput: (inputValueId: string) => void;
  onSetLabelName: (inputValueId: string, name: string) => void;
  onAddNewCatalogueNumberInput: () => void;
  onRemoveCatalogueNumberInput: (inputValueId: string) => void;
  onSetCatalogueNumber: (inputValueId: string, value: string) => void;
  onRemoveRow: () => void;
  onFieldFocus: (key: AddReleaseFormCatalogueNumbersInputFieldKey) => void;
  onBlurRowColumn: (fieldType: CatalogueNumbersInputField) => void;
};

const AddReleaseCatalogueNumbersRow: FC<AddReleaseCatalogueNumbersRowProps> = ({
  row,
  rowIndex,
  showDivider,
  labels,
  catNumberSectionValuesAreInvalid,
  rowErrors,
  onAddNewLabelInput,
  onRemoveLabelInput,
  onSetLabelName,
  onAddNewCatalogueNumberInput,
  onRemoveCatalogueNumberInput,
  onSetCatalogueNumber,
  onRemoveRow,
  onFieldFocus,
  onBlurRowColumn,
}) => {
  const rowBlockClassName =
    rowIndex === 0
      ? `${styles.rowBlock} ${styles.rowBlockFirst}`
      : styles.rowBlock;

  const canRemoveAnyInput =
    row.labelInputValues.length + row.catalogueNumberInputValues.length > 1;

  const rowCommonErrorId = `add-release-cat-row-error-${row.id}`;
  const rowCommonMessages = errorSetToMessages(rowErrors?.rowErrorMessages);

  return (
    <>
      {showDivider && <hr className={styles.divider} aria-hidden />}
      <div className={rowBlockClassName}>
        <div
          role="group"
          aria-label={`Catalogue numbers ${rowIndex + 1}`}
          aria-describedby={
            rowCommonMessages?.length ? rowCommonErrorId : undefined
          }
        >
          <div className={styles.rowColumns}>
            <div className={styles.column}>
              {row.labelInputValues.map((inputValue) => {
                const labelErrorMessages = errorSetToMessages(
                  rowErrors?.labelInputErrorMessages?.[inputValue.id],
                );
                const labelErrorId = `add-release-cat-label-error-${row.id}-${inputValue.id}`;
                const hasLabelErrors =
                  labelErrorMessages != null && labelErrorMessages.length > 0;

                return (
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
                          aria-invalid={hasLabelErrors}
                          aria-describedby={
                            hasLabelErrors ? labelErrorId : undefined
                          }
                          onChange={(e) =>
                            onSetLabelName(inputValue.id, e.target.value)
                          }
                          onFocus={() =>
                            onFieldFocus({
                              catNumberRowId: row.id,
                              field: "label",
                              inputValueId: inputValue.id,
                            })
                          }
                          onBlur={() => onBlurRowColumn("label")}
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
                          {canRemoveAnyInput && (
                            <button
                              type="button"
                              className={styles.removeCross}
                              aria-label="Remove label"
                              title="Remove label"
                              onClick={() => onRemoveLabelInput(inputValue.id)}
                            >
                              <span aria-hidden="true">❌</span>
                            </button>
                          )}
                        </div>
                      </div>
                      {hasLabelErrors && (
                        <div className={styles.fieldErrorSlot}>
                          <FormFieldErrorMessages
                            id={labelErrorId}
                            messages={labelErrorMessages}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {!catNumberSectionValuesAreInvalid && (
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.addAnotherInputValue}
                    onClick={onAddNewLabelInput}
                  >
                    + Add another label
                  </button>
                </div>
              )}
            </div>

            <div className={styles.column}>
              {row.catalogueNumberInputValues.map((inputValue) => {
                const catNumberErrorMessages = errorSetToMessages(
                  rowErrors?.catNumberInputErrorMessages?.[inputValue.id],
                );
                const catNumberErrorId = `add-release-cat-number-error-${row.id}-${inputValue.id}`;
                const hasCatNumberErrors =
                  catNumberErrorMessages != null &&
                  catNumberErrorMessages.length > 0;

                return (
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
                          aria-invalid={hasCatNumberErrors}
                          aria-describedby={
                            hasCatNumberErrors ? catNumberErrorId : undefined
                          }
                          onChange={(e) =>
                            onSetCatalogueNumber(inputValue.id, e.target.value)
                          }
                          onFocus={() =>
                            onFieldFocus({
                              catNumberRowId: row.id,
                              field: "catNumber",
                              inputValueId: inputValue.id,
                            })
                          }
                          onBlur={() => onBlurRowColumn("catNumber")}
                          autoComplete="off"
                        />
                        <div
                          className={styles.removeCrossInputValue}
                          aria-hidden={canRemoveAnyInput ? undefined : true}
                        >
                          {canRemoveAnyInput && (
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
                          )}
                        </div>
                      </div>
                      {hasCatNumberErrors && (
                        <div className={styles.fieldErrorSlot}>
                          <FormFieldErrorMessages
                            id={catNumberErrorId}
                            messages={catNumberErrorMessages}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {!catNumberSectionValuesAreInvalid && (
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.addAnotherInputValue}
                    onClick={onAddNewCatalogueNumberInput}
                  >
                    + Add another catalogue number
                  </button>
                </div>
              )}
            </div>
          </div>

          {rowCommonMessages && rowCommonMessages.length > 0 && (
            <div className={styles.rowErrorSlot}>
              <FormFieldErrorMessages
                id={rowCommonErrorId}
                messages={rowCommonMessages}
              />
            </div>
          )}
        </div>

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
      </div>
    </>
  );
};

export default AddReleaseCatalogueNumbersRow;

const errorSetToMessages = (set?: Set<string>) =>
  set && set.size > 0 ? Array.from(set, (message) => ({ message })) : null;
