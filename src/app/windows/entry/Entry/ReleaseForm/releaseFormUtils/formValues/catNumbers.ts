import type { ReleaseFormTabMode } from "../../../types";

import type { ReleaseByIdResultCatalogueNumbers } from "@/types/releases";
import { valueToArray, formatJson } from "@/utils/common";
import { withNewId } from "@/utils/id";
import {
  type CatNumbersSimpleValue,
  type ReleaseCatNumbersRepresentableAsRow,
  type ReleaseCatNumbersStandardObj,
} from "@/validation";

export type LabelInputValue = {
  id: string;
  name: string;
};

export type CatalogueNumberInputValue = {
  id: string;
  value: string;
};

export type CatalogueNumberRowShape = "flat" | "europeUk";

export type CatalogueNumberRowStateFlat = {
  id: string;
  shape: "flat";
  labelInputValues: LabelInputValue[];
  catalogueNumberInputValues: CatalogueNumberInputValue[];
};

export type CatalogueNumberRowStateEuropeUk = {
  id: string;
  shape: "europeUk";
  labelInputValues: LabelInputValue[];
  europeCatalogueNumberInputValues: CatalogueNumberInputValue[];
  ukCatalogueNumberInputValues: CatalogueNumberInputValue[];
};

export type CatalogueNumberRowState =
  | CatalogueNumberRowStateFlat
  | CatalogueNumberRowStateEuropeUk;

export type ReleaseFormCatNumbersDraft =
  | {
      activeTab: "rows";
      rows: CatalogueNumberRowState[];
    }
  | {
      activeTab: "json";
      value: string;
    };

export const emptyLabelInputValue = (): LabelInputValue =>
  withNewId({ name: "" });

export const emptyCatalogueNumberInputValue = (): CatalogueNumberInputValue =>
  withNewId({ value: "" });

export const defaultCatalogueNumberRow = (): CatalogueNumberRowStateFlat =>
  withNewId({
    shape: "flat",
    labelInputValues: [emptyLabelInputValue()],
    catalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
  });

const defaultCatNumbersDraft = (): ReleaseFormCatNumbersDraft => ({
  activeTab: "rows",
  rows: [defaultCatalogueNumberRow()],
});

const emptyCatNumbersDraft = (): ReleaseFormCatNumbersDraft => ({
  activeTab: "rows",
  rows: [],
});

// flat → europeUk: keep labels, move existing flat values into "in Europe",
// seed "in UK" with one empty input so the user has somewhere to type. If the
// flat row had no catalogue numbers at all, seed "in Europe" with an empty
// input too — both regions are required in europeUk shape.
export const toEuropeUkRow = (
  row: CatalogueNumberRowState,
): CatalogueNumberRowStateEuropeUk => {
  if (row.shape === "europeUk") {
    return row;
  }

  const { id, labelInputValues, catalogueNumberInputValues } = row;

  return {
    id,
    shape: "europeUk",
    labelInputValues,
    europeCatalogueNumberInputValues:
      catalogueNumberInputValues.length > 0
        ? catalogueNumberInputValues
        : [emptyCatalogueNumberInputValue()],
    ukCatalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
  };
};

// europeUk → flat: keep labels, concatenate europe then UK values into a single
// flat list, preserving ids so React keys and per-input errors survive the
// transition.
export const toFlatRow = (
  row: CatalogueNumberRowState,
): CatalogueNumberRowStateFlat => {
  if (row.shape === "flat") {
    return row;
  }

  const {
    id,
    labelInputValues,
    europeCatalogueNumberInputValues,
    ukCatalogueNumberInputValues,
  } = row;

  return {
    id,
    shape: "flat",
    labelInputValues,
    catalogueNumberInputValues: [
      ...europeCatalogueNumberInputValues,
      ...ukCatalogueNumberInputValues,
    ],
  };
};

export const catNumbersToFormValue = (
  catalogueNumbers: ReleaseByIdResultCatalogueNumbers | undefined,
  mode: ReleaseFormTabMode,
): ReleaseFormCatNumbersDraft => {
  if (catalogueNumbers == null) {
    return mode === "update"
      ? emptyCatNumbersDraft()
      : defaultCatNumbersDraft();
  }

  if (!("type" in catalogueNumbers)) {
    return catNumbersJsonDraftFromValue(catalogueNumbers);
  }

  if (catalogueNumbers.type === "complex") {
    return catNumbersJsonDraftFromValue(catalogueNumbers.value);
  }

  return simpleCatNumbersToRowsDraft(catalogueNumbers.value);
};

export const simpleCatNumbersToRowsDraft = (
  value: ReleaseCatNumbersRepresentableAsRow,
): Extract<ReleaseFormCatNumbersDraft, { activeTab: "rows" }> => {
  const catNumbersAsArray = valueToArray(value);

  const rows = catNumbersAsArray
    .map(catNumberSimpleValueToRow)
    .filter((row) => row !== undefined);

  return {
    activeTab: "rows",
    rows: rows.length > 0 ? rows : [defaultCatalogueNumberRow()],
  };
};

const catNumbersJsonDraftFromValue = (
  value: unknown,
): ReleaseFormCatNumbersDraft => ({
  activeTab: "json",
  value: formatJson(value) ?? "",
});

const catNumberSimpleValueToRow = (
  value: ReleaseCatNumbersStandardObj,
): CatalogueNumberRowState | undefined => {
  const labelNames = [
    ...("label" in value ? [value.label] : []),
    ...("labels" in value ? value.labels : []),
  ];
  const labelInputValues =
    labelNames.length > 0
      ? labelNames.map((name) => withNewId({ name }))
      : [emptyLabelInputValue()];

  if ("cat_number" in value) {
    return withNewId({
      shape: "flat" as const,
      labelInputValues,
      catalogueNumberInputValues: [withNewId({ value: value.cat_number })],
    });
  }

  if ("cat_numbers" in value) {
    return catNumbersPropertyToRow(labelInputValues, value.cat_numbers);
  }

  if (labelNames.length === 0) {
    return undefined;
  }

  return withNewId({
    shape: "flat" as const,
    labelInputValues,
    catalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
  });
};

const catNumbersPropertyToRow = (
  labelInputValues: LabelInputValue[],
  property: CatNumbersSimpleValue,
): CatalogueNumberRowState | undefined => {
  if (Array.isArray(property)) {
    const values = property.map((value) => withNewId({ value }));

    return withNewId({
      shape: "flat" as const,
      labelInputValues,
      catalogueNumberInputValues:
        values.length > 0 ? values : [emptyCatalogueNumberInputValue()],
    });
  }

  return europeUkPropertyToRow(labelInputValues, property);
};

const europeUkPropertyToRow = (
  labelInputValues: LabelInputValue[],
  property: Extract<CatNumbersSimpleValue, { "in UK": string | string[] }>,
): CatalogueNumberRowState =>
  withNewId({
    shape: "europeUk" as const,
    labelInputValues,
    europeCatalogueNumberInputValues: valueToArray(property["in Europe"]).map(
      (value) => withNewId({ value }),
    ),
    ukCatalogueNumberInputValues: valueToArray(property["in UK"]).map((value) =>
      withNewId({ value }),
    ),
  });
