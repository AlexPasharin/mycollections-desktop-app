import type { FC } from "react";

import CatalogueNumberInputColumn from "./CatalogueNumberInputColumn";
import styles from "./ReleaseCatalogueNumbersRow.module.css";

import type {
  ReleaseFormCatalogueNumberRowErrors,
  ReleaseFormCatalogueNumbersInputFieldKey,
  CatalogueNumbersInputField,
} from "../../releaseFormUtils/errorMessages";
import type {
  CatalogueNumberRowShape,
  CatalogueNumberRowState,
} from "../../releaseFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import type { LabelListItem } from "@/types/labels";
import { errorSetToMessages } from "@/validation";

export type ReleaseCatalogueNumbersRowProps = {
  row: CatalogueNumberRowState;
  rowIndex: number;
  showDivider: boolean;
  labels: LabelListItem[];
  rowErrors?: ReleaseFormCatalogueNumberRowErrors | undefined;
  onSetRowShape: (shape: CatalogueNumberRowShape) => void;
  onAddNewLabelInput: () => void;
  onRemoveLabelInput: (inputValueId: string) => void;
  onSetLabelName: (inputValueId: string, name: string) => void;
  onAddNewCatalogueNumberInput: () => void;
  onRemoveCatalogueNumberInput: (inputValueId: string) => void;
  onSetCatalogueNumber: (inputValueId: string, value: string) => void;
  onAddNewEuropeCatalogueNumberInput: () => void;
  onRemoveEuropeCatalogueNumberInput: (inputValueId: string) => void;
  onSetEuropeCatalogueNumber: (inputValueId: string, value: string) => void;
  onAddNewUkCatalogueNumberInput: () => void;
  onRemoveUkCatalogueNumberInput: (inputValueId: string) => void;
  onSetUkCatalogueNumber: (inputValueId: string, value: string) => void;
  onRemoveRow: () => void;
  onFieldFocus: (key: ReleaseFormCatalogueNumbersInputFieldKey) => void;
  onBlurRowColumn: (fieldType: CatalogueNumbersInputField) => void;
};

const ReleaseCatalogueNumbersRow: FC<ReleaseCatalogueNumbersRowProps> = ({
  row,
  rowIndex,
  showDivider,
  labels,
  rowErrors,
  onSetRowShape,
  onAddNewLabelInput,
  onRemoveLabelInput,
  onSetLabelName,
  onAddNewCatalogueNumberInput,
  onRemoveCatalogueNumberInput,
  onSetCatalogueNumber,
  onAddNewEuropeCatalogueNumberInput,
  onRemoveEuropeCatalogueNumberInput,
  onSetEuropeCatalogueNumber,
  onAddNewUkCatalogueNumberInput,
  onRemoveUkCatalogueNumberInput,
  onSetUkCatalogueNumber,
  onRemoveRow,
  onFieldFocus,
  onBlurRowColumn,
}) => {
  const rowBlockClassName =
    rowIndex === 0
      ? `${styles.rowBlock} ${styles.rowBlockFirst}`
      : styles.rowBlock;

  const catNumberInputsCount =
    row.shape === "flat"
      ? row.catalogueNumberInputValues.length
      : row.europeCatalogueNumberInputValues.length +
        row.ukCatalogueNumberInputValues.length;

  const totalInputsInRow = row.labelInputValues.length + catNumberInputsCount;

  // Per-column "can remove an input" rules. Flat shape only needs to keep at
  // least one input in the row overall. europeUk shape additionally requires
  // each region to keep at least one input slot — the DB schema forbids an
  // empty region, so we never let the UI reach that state.
  const canRemoveLabelInput =
    row.shape === "flat" ? totalInputsInRow > 1 : true;
  const canRemoveFlatCatNumberInput = totalInputsInRow > 1;
  const canRemoveEuropeCatNumberInput =
    row.shape === "europeUk" && row.europeCatalogueNumberInputValues.length > 1;
  const canRemoveUkCatNumberInput =
    row.shape === "europeUk" && row.ukCatalogueNumberInputValues.length > 1;

  const rowCommonErrorId = `add-release-cat-row-error-${row.id}`;
  const rowCommonMessages = errorSetToMessages(rowErrors?.rowErrorMessages);

  const shapeToggleName = `add-release-cat-row-shape-${row.id}`;

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
              <div className={styles.columnHeading}>Labels</div>
              {row.labelInputValues.map((inputValue, labelIndex) => {
                const labelErrorMessages = errorSetToMessages(
                  rowErrors?.labelInputErrorMessages[inputValue.id],
                );
                const labelErrorId = `add-release-cat-label-error-${row.id}-${inputValue.id}`;
                const hasLabelErrors =
                  labelErrorMessages != null && labelErrorMessages.length > 0;

                return (
                  <div key={inputValue.id} className={styles.inputValueBlock}>
                    <div className={styles.controlWithRemove}>
                      <select
                        id={`add-release-cat-label-${row.id}-${inputValue.id}`}
                        className={styles.input}
                        value={inputValue.name}
                        aria-label={`Label ${labelIndex + 1}`}
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
                        aria-hidden={canRemoveLabelInput ? undefined : true}
                      >
                        {canRemoveLabelInput && (
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
                    <div className={styles.fieldErrorSlot}>
                      <FormFieldErrorMessages
                        id={labelErrorId}
                        messages={labelErrorMessages}
                      />
                    </div>
                  </div>
                );
              })}
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

            <fieldset className={styles.shapeToggle}>
              <legend className={styles.shapeToggleLegend}>
                Catalogue numbers shape
              </legend>
              <label className={styles.shapeToggleOption}>
                <input
                  type="radio"
                  name={shapeToggleName}
                  value="flat"
                  checked={row.shape === "flat"}
                  onChange={() => onSetRowShape("flat")}
                />
                Flat list
              </label>
              <label className={styles.shapeToggleOption}>
                <input
                  type="radio"
                  name={shapeToggleName}
                  value="europeUk"
                  checked={row.shape === "europeUk"}
                  onChange={() => onSetRowShape("europeUk")}
                />
                Split by region (Europe / UK)
              </label>
            </fieldset>

            {row.shape === "flat" && (
              <CatalogueNumberInputColumn
                columnHeading="Catalogue numbers"
                inputAriaLabel="Catalogue number"
                idPrefix="add-release-cat-number"
                errorIdPrefix="add-release-cat-number-error"
                rowId={row.id}
                inputValues={row.catalogueNumberInputValues}
                errorMessagesByInputId={rowErrors?.catNumberInputErrorMessages}
                canRemoveAnyInput={canRemoveFlatCatNumberInput}
                addButtonLabel="+ Add another catalogue number"
                removeInputAriaLabel="Remove catalogue number"
                onSetValue={onSetCatalogueNumber}
                onAddInput={onAddNewCatalogueNumberInput}
                onRemoveInput={onRemoveCatalogueNumberInput}
                onInputFocus={(inputValueId) =>
                  onFieldFocus({
                    catNumberRowId: row.id,
                    field: "catNumber",
                    inputValueId,
                  })
                }
                onInputBlur={() => onBlurRowColumn("catNumber")}
              />
            )}

            {row.shape === "europeUk" && (
              <>
                <CatalogueNumberInputColumn
                  columnHeading="Catalogue numbers in UK"
                  inputAriaLabel="Catalogue number in UK"
                  idPrefix="add-release-cat-uk"
                  errorIdPrefix="add-release-cat-uk-error"
                  rowId={row.id}
                  inputValues={row.ukCatalogueNumberInputValues}
                  errorMessagesByInputId={
                    rowErrors?.ukCatNumberInputErrorMessages
                  }
                  canRemoveAnyInput={canRemoveUkCatNumberInput}
                  addButtonLabel='+ Add another "in UK" value'
                  removeInputAriaLabel='Remove "in UK" catalogue number'
                  onSetValue={onSetUkCatalogueNumber}
                  onAddInput={onAddNewUkCatalogueNumberInput}
                  onRemoveInput={onRemoveUkCatalogueNumberInput}
                  onInputFocus={(inputValueId) =>
                    onFieldFocus({
                      catNumberRowId: row.id,
                      field: "ukCatNumber",
                      inputValueId,
                    })
                  }
                  onInputBlur={() => onBlurRowColumn("ukCatNumber")}
                />
                <CatalogueNumberInputColumn
                  columnHeading="Catalogue numbers in Europe"
                  inputAriaLabel="Catalogue number in Europe"
                  idPrefix="add-release-cat-europe"
                  errorIdPrefix="add-release-cat-europe-error"
                  rowId={row.id}
                  inputValues={row.europeCatalogueNumberInputValues}
                  errorMessagesByInputId={
                    rowErrors?.europeCatNumberInputErrorMessages
                  }
                  canRemoveAnyInput={canRemoveEuropeCatNumberInput}
                  addButtonLabel='+ Add another "in Europe" value'
                  removeInputAriaLabel='Remove "in Europe" catalogue number'
                  onSetValue={onSetEuropeCatalogueNumber}
                  onAddInput={onAddNewEuropeCatalogueNumberInput}
                  onRemoveInput={onRemoveEuropeCatalogueNumberInput}
                  onInputFocus={(inputValueId) =>
                    onFieldFocus({
                      catNumberRowId: row.id,
                      field: "europeCatNumber",
                      inputValueId,
                    })
                  }
                  onInputBlur={() => onBlurRowColumn("europeCatNumber")}
                />
              </>
            )}
          </div>

          <div className={styles.rowErrorSlot}>
            <FormFieldErrorMessages
              id={rowCommonErrorId}
              messages={rowCommonMessages}
            />
          </div>
        </div>

        <div className={styles.removeRow}>
          <button
            type="button"
            className={styles.removeRowButton}
            aria-label={`Remove catalogue numbers row ${rowIndex + 1}`}
            onClick={onRemoveRow}
          >
            Remove catalogue numbers row
          </button>
        </div>
      </div>
    </>
  );
};

export default ReleaseCatalogueNumbersRow;
