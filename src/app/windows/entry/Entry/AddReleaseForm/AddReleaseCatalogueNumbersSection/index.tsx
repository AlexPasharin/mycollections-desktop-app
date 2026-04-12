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
  const addRow = () => {
    setCatalogueNumbers((prev) => [...prev, defaultCatalogueNumberRow()]);
  };

  const removeRow = (rowId: string) => {
    setCatalogueNumbers((prev) => prev.filter((row) => row.id !== rowId));
  };

  const addLabelInputValue = (rowId: string) => {
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

  const removeLabelInputValue = (rowId: string, inputValueId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextLabelInputValues = row.labelInputValues.filter(
          (inputValue) => inputValue.id !== inputValueId,
        );

        if (
          nextLabelInputValues.length + row.catalogueNumberInputValues.length <
          1
        ) {
          return row;
        }

        return {
          ...row,
          labelInputValues: nextLabelInputValues,
        };
      }),
    );
  };

  const setLabelInputValueName = (
    rowId: string,
    inputValueId: string,
    name: string,
  ) => {
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

  const addCatalogueNumberInputValue = (rowId: string) => {
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

  const removeCatalogueNumberInputValue = (
    rowId: string,
    inputValueId: string,
  ) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextCatalogueNumberInputValues =
          row.catalogueNumberInputValues.filter(
            (inputValue) => inputValue.id !== inputValueId,
          );

        if (
          row.labelInputValues.length + nextCatalogueNumberInputValues.length <
          1
        ) {
          return row;
        }

        return {
          ...row,
          catalogueNumberInputValues: nextCatalogueNumberInputValues,
        };
      }),
    );
  };

  const setCatalogueNumberInputValue = (
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
            onAddLabelInputValue={() => addLabelInputValue(row.id)}
            onRemoveLabelInputValue={(inputValueId) =>
              removeLabelInputValue(row.id, inputValueId)
            }
            onSetLabelInputValueName={(inputValueId, name) =>
              setLabelInputValueName(row.id, inputValueId, name)
            }
            onAddCatalogueNumberInputValue={() =>
              addCatalogueNumberInputValue(row.id)
            }
            onRemoveCatalogueNumberInputValue={(inputValueId) =>
              removeCatalogueNumberInputValue(row.id, inputValueId)
            }
            onSetCatalogueNumberInputValue={(inputValueId, value) =>
              setCatalogueNumberInputValue(row.id, inputValueId, value)
            }
            onRemoveRow={rowIndex > 0 ? () => removeRow(row.id) : undefined}
          />
        </div>
      ))}

      <button type="button" className={styles.addAnotherRow} onClick={addRow}>
        + Add another catalogue row
      </button>
    </div>
  );
};

export default AddReleaseCatalogueNumbersSection;
