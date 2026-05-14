import type { FC } from "react";

import AddReleaseCatalogueNumbersRow from "./AddReleaseCatalogueNumbersRow";
import styles from "./AddReleaseCatalogueNumbersSection.module.css";

import {
  type AddReleaseFormCatalogueNumbersInputFieldKey,
  type AddReleaseFormCatNumbersErrors,
  type CatalogueNumbersInputField,
} from "../addReleaseFormUtils/errorMessages";
import {
  emptyCatalogueNumberInputValue,
  emptyLabelInputValue,
  toEuropeUkRow,
  toFlatRow,
  type CatalogueNumberInputValue,
  type CatalogueNumberRowShape,
  type CatalogueNumberRowState,
  type CatalogueNumberRowStateEuropeUk,
  type CatalogueNumberRowStateFlat,
  type LabelInputValue,
} from "../addReleaseFormUtils/formValues";

import type { LabelListItem } from "@/types/labels";

export type SetAddReleaseCatalogueNumbers = (
  update: (prev: CatalogueNumberRowState[]) => CatalogueNumberRowState[],
) => void;

export type AddReleaseCatalogueNumbersSectionProps = {
  labels: LabelListItem[];
  catalogueNumbers: CatalogueNumberRowState[];
  setCatalogueNumbers: SetAddReleaseCatalogueNumbers;
  errors?: AddReleaseFormCatNumbersErrors;
  addCatalogueNumbersRow: () => void;
  removeCatalogueNumbersRow: (rowId: string) => void;
  onFieldFocus: (key: AddReleaseFormCatalogueNumbersInputFieldKey) => void;
  onBlurRowColumn: (
    rowId: string,
    fieldType: CatalogueNumbersInputField,
  ) => void;
};

const AddReleaseCatalogueNumbersSection: FC<
  AddReleaseCatalogueNumbersSectionProps
> = ({
  labels,
  catalogueNumbers,
  setCatalogueNumbers,
  errors,
  addCatalogueNumbersRow,
  removeCatalogueNumbersRow,
  onFieldFocus,
  onBlurRowColumn,
}) => {
  const updateRow = (
    rowId: string,
    update: (row: CatalogueNumberRowState) => CatalogueNumberRowState,
  ) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => (row.id === rowId ? update(row) : row)),
    );
  };

  const setRowShape = (rowId: string, shape: CatalogueNumberRowShape) => {
    updateRow(rowId, (row) =>
      shape === "flat" ? toFlatRow(row) : toEuropeUkRow(row),
    );
  };

  const updateLabelInputs = (
    rowId: string,
    transform: (inputs: LabelInputValue[]) => LabelInputValue[],
  ) => {
    updateRow(rowId, (row) => ({
      ...row,
      labelInputValues: transform(row.labelInputValues),
    }));
  };

  const addNewLabelInput = (rowId: string) => {
    updateLabelInputs(rowId, (inputs) => [...inputs, emptyLabelInputValue()]);
  };

  const removeLabelInput = (rowId: string, inputValueId: string) => {
    updateLabelInputs(rowId, (inputs) =>
      inputs.filter((inputValue) => inputValue.id !== inputValueId),
    );
  };

  const setLabelName = (rowId: string, inputValueId: string, name: string) => {
    updateLabelInputs(rowId, (inputs) =>
      inputs.map((inputValue) =>
        inputValue.id === inputValueId ? { ...inputValue, name } : inputValue,
      ),
    );
  };

  const updateFlatCatalogueNumberInputs = (
    rowId: string,
    transform: (
      inputs: CatalogueNumberInputValue[],
    ) => CatalogueNumberInputValue[],
  ) => {
    updateRow(rowId, (row) =>
      row.shape === "flat"
        ? ({
            ...row,
            catalogueNumberInputValues: transform(
              row.catalogueNumberInputValues,
            ),
          } satisfies CatalogueNumberRowStateFlat)
        : row,
    );
  };

  const updateEuropeCatalogueNumberInputs = (
    rowId: string,
    transform: (
      inputs: CatalogueNumberInputValue[],
    ) => CatalogueNumberInputValue[],
  ) => {
    updateRow(rowId, (row) =>
      row.shape === "europeUk"
        ? ({
            ...row,
            europeCatalogueNumberInputValues: transform(
              row.europeCatalogueNumberInputValues,
            ),
          } satisfies CatalogueNumberRowStateEuropeUk)
        : row,
    );
  };

  const updateUkCatalogueNumberInputs = (
    rowId: string,
    transform: (
      inputs: CatalogueNumberInputValue[],
    ) => CatalogueNumberInputValue[],
  ) => {
    updateRow(rowId, (row) =>
      row.shape === "europeUk"
        ? ({
            ...row,
            ukCatalogueNumberInputValues: transform(
              row.ukCatalogueNumberInputValues,
            ),
          } satisfies CatalogueNumberRowStateEuropeUk)
        : row,
    );
  };

  const addNewCatalogueNumberInput = (rowId: string) => {
    updateFlatCatalogueNumberInputs(rowId, (inputs) => [
      ...inputs,
      emptyCatalogueNumberInputValue(),
    ]);
  };

  const removeCatalogueNumberInput = (rowId: string, inputValueId: string) => {
    updateFlatCatalogueNumberInputs(rowId, (inputs) =>
      inputs.filter((inputValue) => inputValue.id !== inputValueId),
    );
  };

  const setCatalogueNumber = (
    rowId: string,
    inputValueId: string,
    value: string,
  ) => {
    updateFlatCatalogueNumberInputs(rowId, (inputs) =>
      inputs.map((inputValue) =>
        inputValue.id === inputValueId ? { ...inputValue, value } : inputValue,
      ),
    );
  };

  const addNewEuropeCatalogueNumberInput = (rowId: string) => {
    updateEuropeCatalogueNumberInputs(rowId, (inputs) => [
      ...inputs,
      emptyCatalogueNumberInputValue(),
    ]);
  };

  const removeEuropeCatalogueNumberInput = (
    rowId: string,
    inputValueId: string,
  ) => {
    updateEuropeCatalogueNumberInputs(rowId, (inputs) =>
      inputs.filter((inputValue) => inputValue.id !== inputValueId),
    );
  };

  const setEuropeCatalogueNumber = (
    rowId: string,
    inputValueId: string,
    value: string,
  ) => {
    updateEuropeCatalogueNumberInputs(rowId, (inputs) =>
      inputs.map((inputValue) =>
        inputValue.id === inputValueId ? { ...inputValue, value } : inputValue,
      ),
    );
  };

  const addNewUkCatalogueNumberInput = (rowId: string) => {
    updateUkCatalogueNumberInputs(rowId, (inputs) => [
      ...inputs,
      emptyCatalogueNumberInputValue(),
    ]);
  };

  const removeUkCatalogueNumberInput = (
    rowId: string,
    inputValueId: string,
  ) => {
    updateUkCatalogueNumberInputs(rowId, (inputs) =>
      inputs.filter((inputValue) => inputValue.id !== inputValueId),
    );
  };

  const setUkCatalogueNumber = (
    rowId: string,
    inputValueId: string,
    value: string,
  ) => {
    updateUkCatalogueNumberInputs(rowId, (inputs) =>
      inputs.map((inputValue) =>
        inputValue.id === inputValueId ? { ...inputValue, value } : inputValue,
      ),
    );
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Catalogue numbers</h2>

      {catalogueNumbers.map((row, rowIndex) => (
        <div key={row.id}>
          <AddReleaseCatalogueNumbersRow
            row={row}
            rowIndex={rowIndex}
            showDivider={rowIndex > 0}
            labels={labels}
            rowErrors={errors?.[row.id]}
            onSetRowShape={(shape) => setRowShape(row.id, shape)}
            onAddNewLabelInput={() => addNewLabelInput(row.id)}
            onSetLabelName={(inputValueId, name) =>
              setLabelName(row.id, inputValueId, name)
            }
            onRemoveLabelInput={(inputValueId) =>
              removeLabelInput(row.id, inputValueId)
            }
            onAddNewCatalogueNumberInput={() =>
              addNewCatalogueNumberInput(row.id)
            }
            onRemoveCatalogueNumberInput={(inputValueId) =>
              removeCatalogueNumberInput(row.id, inputValueId)
            }
            onSetCatalogueNumber={(inputValueId, value) =>
              setCatalogueNumber(row.id, inputValueId, value)
            }
            onAddNewEuropeCatalogueNumberInput={() =>
              addNewEuropeCatalogueNumberInput(row.id)
            }
            onRemoveEuropeCatalogueNumberInput={(inputValueId) =>
              removeEuropeCatalogueNumberInput(row.id, inputValueId)
            }
            onSetEuropeCatalogueNumber={(inputValueId, value) =>
              setEuropeCatalogueNumber(row.id, inputValueId, value)
            }
            onAddNewUkCatalogueNumberInput={() =>
              addNewUkCatalogueNumberInput(row.id)
            }
            onRemoveUkCatalogueNumberInput={(inputValueId) =>
              removeUkCatalogueNumberInput(row.id, inputValueId)
            }
            onSetUkCatalogueNumber={(inputValueId, value) =>
              setUkCatalogueNumber(row.id, inputValueId, value)
            }
            onRemoveRow={() => removeCatalogueNumbersRow(row.id)}
            onFieldFocus={onFieldFocus}
            onBlurRowColumn={(fieldType) => onBlurRowColumn(row.id, fieldType)}
          />
        </div>
      ))}

      <button
        type="button"
        className={styles.addAnotherRow}
        onClick={addCatalogueNumbersRow}
      >
        + Add another catalogue row
      </button>
    </div>
  );
};

export default AddReleaseCatalogueNumbersSection;
