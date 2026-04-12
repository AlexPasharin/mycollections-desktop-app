import { useState, type FC } from "react";

import AddReleaseCatalogueNumbersRow from "./AddReleaseCatalogueNumbersRow";
import styles from "./AddReleaseCatalogueNumbersSection.module.css";
import {
  defaultCatalogueNumberRow,
  emptyCatalogueNumberSlot,
  emptyLabelSlot,
  type CatalogueNumberRowState,
} from "./catalogueNumbersRowState";

import type { LabelListItem } from "@/types/labels";

export type AddReleaseCatalogueNumbersSectionProps = {
  labels: LabelListItem[];
};

const AddReleaseCatalogueNumbersSection: FC<
  AddReleaseCatalogueNumbersSectionProps
> = ({ labels }) => {
  const [rows, setRows] = useState<CatalogueNumberRowState[]>([
    defaultCatalogueNumberRow(),
  ]);

  const addRow = () => {
    setRows((prev) => [...prev, defaultCatalogueNumberRow()]);
  };

  const removeRow = (rowId: string) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.id !== rowId),
    );
  };

  const addLabelSlot = (rowId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, labelSlots: [...row.labelSlots, emptyLabelSlot()] }
          : row,
      ),
    );
  };

  const removeLabelSlot = (rowId: string, slotId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        if (row.labelSlots[0]?.id === slotId) {
          return row;
        }

        return {
          ...row,
          labelSlots: row.labelSlots.filter((slot) => slot.id !== slotId),
        };
      }),
    );
  };

  const setLabelSlotName = (rowId: string, slotId: string, name: string) => {
    setRows((prev) =>
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
    setRows((prev) =>
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
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        if (row.catalogueNumberSlots[0]?.id === slotId) {
          return row;
        }

        return {
          ...row,
          catalogueNumberSlots: row.catalogueNumberSlots.filter(
            (slot) => slot.id !== slotId,
          ),
        };
      }),
    );
  };

  const setCatalogueNumberSlotValue = (
    rowId: string,
    slotId: string,
    value: string,
  ) => {
    setRows((prev) =>
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

      {rows.map((row, rowIndex) => (
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
