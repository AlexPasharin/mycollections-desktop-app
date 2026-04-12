import type { FC } from "react";

import AddReleaseCatalogueNumbersRow from "./AddReleaseCatalogueNumbersRow";
import styles from "./AddReleaseCatalogueNumbersSection.module.css";

import {
  defaultCatalogueNumberRow,
  emptyCatalogueNumberInputValue,
  emptyLabelInputValue,
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
};

const AddReleaseCatalogueNumbersSection: FC<
  AddReleaseCatalogueNumbersSectionProps
> = ({ labels, catalogueNumbers, setCatalogueNumbers }) => {
  const addCatNumbersRow = () => {
    setCatalogueNumbers((prev) => [...prev, defaultCatalogueNumberRow()]);
  };

  const removeCatNumbersRow = (rowId: string) => {
    setCatalogueNumbers((prev) => prev.filter((row) => row.id !== rowId));
  };

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
      <p className={styles.heading}>Catalogue numbers</p>

      {catalogueNumbers.map((row, rowIndex) => (
        <div key={row.id}>
          <AddReleaseCatalogueNumbersRow
            row={row}
            rowIndex={rowIndex}
            showDivider={rowIndex > 0}
            labels={labels}
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
            onRemoveRow={
              rowIndex > 0 ? () => removeCatNumbersRow(row.id) : undefined
            }
          />
        </div>
      ))}

      <button
        type="button"
        className={styles.addAnotherRow}
        onClick={addCatNumbersRow}
      >
        + Add another catalogue row
      </button>
    </div>
  );
};

export default AddReleaseCatalogueNumbersSection;
