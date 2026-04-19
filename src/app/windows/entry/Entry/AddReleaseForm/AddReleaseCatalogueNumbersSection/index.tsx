import type { FC } from "react";

import AddReleaseCatalogueNumbersRow from "./AddReleaseCatalogueNumbersRow";
import styles from "./AddReleaseCatalogueNumbersSection.module.css";

import {
  emptyCatalogueNumberInputValue,
  emptyLabelInputValue,
  type AddReleaseFormCatalogueNumberRowErrors,
  type AddReleaseFormCatalogueNumbersInputFieldKey,
  type AddReleaseFormFieldErrors,
  type CatalogueNumbersInputField,
  type CatalogueNumberRowState,
} from "../addReleaseFormUtils";

import type { LabelListItem } from "@/types/labels";

export type SetAddReleaseCatalogueNumbers = (
  update: (prev: CatalogueNumberRowState[]) => CatalogueNumberRowState[],
) => void;

export type AddReleaseCatalogueNumbersSectionProps = {
  labels: LabelListItem[];
  catalogueNumbers: CatalogueNumberRowState[];
  setCatalogueNumbers: SetAddReleaseCatalogueNumbers;
  errors?: AddReleaseFormFieldErrors["catalogueNumbers"];
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
  const catNumberSectionValuesAreInvalid =
    !catalogueNumberRowsAreFullyFilled(catalogueNumbers) ||
    catalogueNumbersSectionHasAnyErrors(errors);

  const addNewLabelInput = (rowId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              labelInputValues: [
                ...row.labelInputValues,
                emptyLabelInputValue(),
              ],
            }
          : row,
      ),
    );
  };

  const removeLabelInput = (rowId: string, inputValueId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          labelInputValues: row.labelInputValues.filter(
            (inputValue) => inputValue.id !== inputValueId,
          ),
        };
      }),
    );
  };

  const setLabelName = (rowId: string, inputValueId: string, name: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              labelInputValues: row.labelInputValues.map((inputValue) =>
                inputValue.id === inputValueId
                  ? { ...inputValue, name }
                  : inputValue,
              ),
            }
          : row,
      ),
    );
  };

  const addNewCatalogueNumberInput = (rowId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              catalogueNumberInputValues: [
                ...row.catalogueNumberInputValues,
                emptyCatalogueNumberInputValue(),
              ],
            }
          : row,
      ),
    );
  };

  const removeCatalogueNumberInput = (rowId: string, inputValueId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          catalogueNumberInputValues: row.catalogueNumberInputValues.filter(
            (inputValue) => inputValue.id !== inputValueId,
          ),
        };
      }),
    );
  };

  const setCatalogueNumber = (
    rowId: string,
    inputValueId: string,
    value: string,
  ) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              catalogueNumberInputValues: row.catalogueNumberInputValues.map(
                (inputValue) =>
                  inputValue.id === inputValueId
                    ? { ...inputValue, value }
                    : inputValue,
              ),
            }
          : row,
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
            catNumberSectionValuesAreInvalid={catNumberSectionValuesAreInvalid}
            rowErrors={errors?.[row.id]}
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
            onRemoveRow={() => removeCatalogueNumbersRow(row.id)}
            onFieldFocus={onFieldFocus}
            onBlurRowColumn={(fieldType) => onBlurRowColumn(row.id, fieldType)}
          />
        </div>
      ))}

      {!catNumberSectionValuesAreInvalid && (
        <button
          type="button"
          className={styles.addAnotherRow}
          onClick={addCatalogueNumbersRow}
        >
          + Add another catalogue row
        </button>
      )}
    </div>
  );
};

export default AddReleaseCatalogueNumbersSection;

const catalogueNumberRowErrorsHasMessages = (
  rowErrors: AddReleaseFormCatalogueNumberRowErrors | undefined,
): boolean => {
  if (!rowErrors) {
    return false;
  }

  if ((rowErrors.rowErrorMessages?.size ?? 0) > 0) {
    return true;
  }

  for (const messageSet of Object.values(
    rowErrors.labelInputErrorMessages ?? {},
  )) {
    if (messageSet.size > 0) {
      return true;
    }
  }

  for (const messageSet of Object.values(
    rowErrors.catNumberInputErrorMessages ?? {},
  )) {
    if (messageSet.size > 0) {
      return true;
    }
  }

  return false;
};

const catalogueNumberRowsAreFullyFilled = (
  rows: CatalogueNumberRowState[],
): boolean =>
  rows.every(
    (row) =>
      row.labelInputValues.every((label) => label.name.trim().length > 0) &&
      row.catalogueNumberInputValues.every(
        (cat) => cat.value.trim().length > 0,
      ),
  );

const catalogueNumbersSectionHasAnyErrors = (
  catalogueNumbersErrors:
    | AddReleaseFormFieldErrors["catalogueNumbers"]
    | undefined,
): boolean =>
  Object.values(catalogueNumbersErrors ?? {}).some((rowErrors) =>
    catalogueNumberRowErrorsHasMessages(rowErrors),
  );
