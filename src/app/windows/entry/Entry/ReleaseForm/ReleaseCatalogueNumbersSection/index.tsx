import { type FC, type FocusEvent } from "react";

import ReleaseCatalogueNumbersRow from "./ReleaseCatalogueNumbersRow";
import styles from "./ReleaseCatalogueNumbersSection.module.css";

import {
  type ReleaseFormCatalogueNumbersInputFieldKey,
  type ReleaseFormCatNumbersFieldErrors,
  type CatalogueNumbersInputField,
} from "../releaseFormUtils/errorMessages";
import {
  emptyCatalogueNumberInputValue,
  emptyLabelInputValue,
  simpleCatNumbersToRowsDraft,
  toEuropeUkRow,
  toFlatRow,
  type CatalogueNumberInputValue,
  type CatalogueNumberRowShape,
  type CatalogueNumberRowState,
  type CatalogueNumberRowStateEuropeUk,
  type CatalogueNumberRowStateFlat,
  type LabelInputValue,
  type ReleaseFormCatNumbersDraft,
} from "../releaseFormUtils/formValues";
import { toReleaseCatNumbersJson } from "../releaseFormUtils/toUpsertMusicalReleaseInput";
import { parseReleaseCatNumbersJsonInput } from "../releaseFormUtils/validation/catalogueNumbersJsonInput";

import FeedbackSection from "@/app/components/FeedbackSection";
import Tabs from "@/app/components/Tabs";
import type { FeedbackNotifications } from "@/types/form";
import type { LabelListItem } from "@/types/labels";
import { formatJson } from "@/utils/common";

const CATALOGUE_NUMBERS_JSON_ERROR_ID =
  "add-release-catalogue-numbers-json-error";
const CATALOGUE_NUMBERS_JSON_NOTIFICATIONS_ID =
  "add-release-catalogue-numbers-json-notifications";
const CATALOGUE_NUMBERS_ROWS_TAB_ID = "release-catalogue-numbers-rows-tab";
const CATALOGUE_NUMBERS_ROWS_PANEL_ID = "release-catalogue-numbers-rows-panel";
const CATALOGUE_NUMBERS_JSON_TAB_ID = "release-catalogue-numbers-json-tab";
const CATALOGUE_NUMBERS_JSON_PANEL_ID = "release-catalogue-numbers-json-panel";

export type SetReleaseCatalogueNumbers = (
  update: (prev: ReleaseFormCatNumbersDraft) => ReleaseFormCatNumbersDraft,
) => void;

export type ReleaseCatalogueNumbersSectionProps = {
  labels: LabelListItem[];
  catalogueNumbers: ReleaseFormCatNumbersDraft;
  setCatalogueNumbers: SetReleaseCatalogueNumbers;
  errors: ReleaseFormCatNumbersFieldErrors;
  notifications: FeedbackNotifications;
  addCatalogueNumbersRow: () => void;
  removeCatalogueNumbersRow: (rowId: string) => void;
  onFieldFocus: (key: ReleaseFormCatalogueNumbersInputFieldKey) => void;
  onBlurRowColumn: (
    rowId: string,
    fieldType: CatalogueNumbersInputField,
  ) => void;
  onJsonInputFocus: () => void;
  onJsonInputBlur: () => void;
};

const ReleaseCatalogueNumbersSection: FC<
  ReleaseCatalogueNumbersSectionProps
> = ({
  labels,
  catalogueNumbers,
  setCatalogueNumbers,
  errors,
  notifications,
  addCatalogueNumbersRow,
  removeCatalogueNumbersRow,
  onFieldFocus,
  onBlurRowColumn,
  onJsonInputFocus,
  onJsonInputBlur,
}) => {
  const updateRow = (
    rowId: string,
    update: (row: CatalogueNumberRowState) => CatalogueNumberRowState,
  ) => {
    setCatalogueNumbers((prev) =>
      prev.activeTab === "json"
        ? prev
        : {
            ...prev,
            rows: prev.rows.map((row) =>
              row.id === rowId ? update(row) : row,
            ),
          },
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

  const jsonInputErrors = errors.jsonInput;
  const hasJsonInputErrors = jsonInputErrors.length > 0;
  const hasJsonInputNotifications = notifications.length > 0;

  const jsonInputDescribedByIds = [
    hasJsonInputErrors ? CATALOGUE_NUMBERS_JSON_ERROR_ID : null,
    hasJsonInputNotifications ? CATALOGUE_NUMBERS_JSON_NOTIFICATIONS_ID : null,
  ]
    .filter((id): id is string => id !== null)
    .join(" ");

  const focusLeftJsonWrapper = (e: FocusEvent<HTMLDivElement>) =>
    !e.currentTarget.contains(e.relatedTarget);

  const handleJsonFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (focusLeftJsonWrapper(e)) {
      onJsonInputFocus();
    }
  };

  const handleJsonBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (focusLeftJsonWrapper(e)) {
      onJsonInputBlur();
    }
  };

  const handleTabChange = (
    nextTab: ReleaseFormCatNumbersDraft["activeTab"],
  ) => {
    setCatalogueNumbers((prev) => switchCatNumbersDraftTab(prev, nextTab));
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Catalogue numbers</h2>

      <Tabs
        ariaLabel="Catalogue numbers input mode"
        activeTab={catalogueNumbers.activeTab}
        onTabChange={handleTabChange}
        tabs={[
          {
            id: "rows",
            tabId: CATALOGUE_NUMBERS_ROWS_TAB_ID,
            panelId: CATALOGUE_NUMBERS_ROWS_PANEL_ID,
            label: "Rows",
            children: (
              <>
                {catalogueNumbers.activeTab === "rows" &&
                  catalogueNumbers.rows.map((row, rowIndex) => (
                    <div key={row.id}>
                      <ReleaseCatalogueNumbersRow
                        row={row}
                        rowIndex={rowIndex}
                        showDivider={rowIndex > 0}
                        labels={labels}
                        rowErrors={errors.rows[row.id]}
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
                        onBlurRowColumn={(fieldType) =>
                          onBlurRowColumn(row.id, fieldType)
                        }
                      />
                    </div>
                  ))}

                {catalogueNumbers.activeTab === "rows" && (
                  <button
                    type="button"
                    className={styles.addAnotherRow}
                    onClick={addCatalogueNumbersRow}
                  >
                    + Add another catalogue row
                  </button>
                )}
              </>
            ),
          },
          {
            id: "json",
            tabId: CATALOGUE_NUMBERS_JSON_TAB_ID,
            panelId: CATALOGUE_NUMBERS_JSON_PANEL_ID,
            label: "JSON",
            children: (
              <div
                className={styles.jsonField}
                onFocus={handleJsonFocus}
                onBlur={handleJsonBlur}
              >
                <label
                  className={styles.jsonLabel}
                  htmlFor="add-release-catalogue-numbers"
                >
                  Catalogue numbers JSON
                </label>
                <textarea
                  id="add-release-catalogue-numbers"
                  className={styles.jsonTextarea}
                  rows={6}
                  value={
                    catalogueNumbers.activeTab === "json"
                      ? catalogueNumbers.value
                      : ""
                  }
                  onChange={(e) =>
                    setCatalogueNumbers((prev) =>
                      prev.activeTab === "json"
                        ? {
                            ...prev,
                            value: e.target.value,
                          }
                        : prev,
                    )
                  }
                  aria-invalid={hasJsonInputErrors}
                  aria-describedby={
                    jsonInputDescribedByIds === ""
                      ? undefined
                      : jsonInputDescribedByIds
                  }
                  autoComplete="off"
                />
                <FeedbackSection
                  notificationsId={CATALOGUE_NUMBERS_JSON_NOTIFICATIONS_ID}
                  errorsId={CATALOGUE_NUMBERS_JSON_ERROR_ID}
                  notifications={notifications}
                  errors={jsonInputErrors}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

const switchCatNumbersDraftTab = (
  prev: ReleaseFormCatNumbersDraft,
  nextTab: ReleaseFormCatNumbersDraft["activeTab"],
): ReleaseFormCatNumbersDraft => {
  if (prev.activeTab === nextTab) {
    return prev;
  }

  if (nextTab === "json") {
    return {
      activeTab: "json",
      value: formatJson(toReleaseCatNumbersJson(prev)) ?? "",
    };
  }

  // not possible at this point, but simplifies type checking
  if (prev.activeTab !== "json") {
    return prev;
  }

  try {
    const parsed = parseReleaseCatNumbersJsonInput(prev.value);

    if (parsed === null) {
      return { activeTab: "rows", rows: [] };
    }

    if (parsed.type === "complex") {
      return prev;
    }

    return simpleCatNumbersToRowsDraft(parsed.value);
  } catch {
    return prev;
  }
};

export default ReleaseCatalogueNumbersSection;
