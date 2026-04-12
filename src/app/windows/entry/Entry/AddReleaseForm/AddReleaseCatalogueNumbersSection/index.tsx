import type { FC } from "react";

import AddReleaseCatalogueNumbersRow from "./AddReleaseCatalogueNumbersRow";
import styles from "./AddReleaseCatalogueNumbersSection.module.css";
import {
  defaultCatalogueNumberRow,
  emptyCatalogueNumberSlot,
  emptyLabelSlot,
  type CatalogueNumberRowState,
} from "./catalogueNumbersRowState";

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
    setCatalogueNumbers((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.id !== rowId),
    );
  };

  const addLabelSlot = (rowId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, labelSlots: [...row.labelSlots, emptyLabelSlot()] }
          : row,
      ),
    );
  };

  const removeLabelSlot = (rowId: string, slotId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextLabelSlots = row.labelSlots.filter(
          (slot) => slot.id !== slotId,
        );

        if (nextLabelSlots.length + row.catalogueNumberSlots.length < 1) {
          return row;
        }

        return {
          ...row,
          labelSlots: nextLabelSlots,
        };
      }),
    );
  };

  const setLabelSlotName = (rowId: string, slotId: string, name: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              labelSlots: row.labelSlots.map((slot) =>
                slot.id === slotId ? { ...slot, name } : slot,
              ),
            }
          : row,
      ),
    );
  };

  const addCatalogueNumberSlot = (rowId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              catalogueNumberSlots: [
                ...row.catalogueNumberSlots,
                emptyCatalogueNumberSlot(),
              ],
            }
          : row,
      ),
    );
  };

  const removeCatalogueNumberSlot = (rowId: string, slotId: string) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextCatalogueNumberSlots = row.catalogueNumberSlots.filter(
          (slot) => slot.id !== slotId,
        );

        if (row.labelSlots.length + nextCatalogueNumberSlots.length < 1) {
          return row;
        }

        return {
          ...row,
          catalogueNumberSlots: nextCatalogueNumberSlots,
        };
      }),
    );
  };

  const setCatalogueNumberSlotValue = (
    rowId: string,
    slotId: string,
    value: string,
  ) => {
    setCatalogueNumbers((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              catalogueNumberSlots: row.catalogueNumberSlots.map((slot) =>
                slot.id === slotId ? { ...slot, value } : slot,
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
            onAddLabelSlot={() => addLabelSlot(row.id)}
            onRemoveLabelSlot={(slotId) => removeLabelSlot(row.id, slotId)}
            onSetLabelSlotName={(slotId, name) =>
              setLabelSlotName(row.id, slotId, name)
            }
            onAddCatalogueNumberSlot={() => addCatalogueNumberSlot(row.id)}
            onRemoveCatalogueNumberSlot={(slotId) =>
              removeCatalogueNumberSlot(row.id, slotId)
            }
            onSetCatalogueNumberSlotValue={(slotId, value) =>
              setCatalogueNumberSlotValue(row.id, slotId, value)
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
