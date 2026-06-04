import {
  initialAddReleaseFormFieldErrors,
  type AddReleaseFormCatNumbersErrors,
  type AddReleaseFormCountriesErrors,
  type AddReleaseFormFormatErrors,
} from "./errorMessages";
import {
  validateDiscogsUrl,
  validateReleaseCountries,
  validateReleaseFormats,
  validateReleaseCatNumbers,
  validateReleaseMatrixRunout,
} from "./validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";
import type { EntryAltNameInfo, EntryByIdResult } from "@/types/entries";
import type { FormField, FormFieldValidationResult } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { TagId } from "@/types/tags";
import { withNewId } from "@/utils/id";
import {
  validateOptionalTrimmedText,
  validateReleaseDate,
  validateRequiredTrimmedText,
} from "@/validation";

export type AddReleaseFormNameInput = Omit<EntryAltNameInfo, "nameId"> & {
  nameId: string | null;
};

export const defaultNameInput = (name: string): AddReleaseFormNameInput => ({
  nameId: null,
  name,
});

export type AddReleaseFormEntry = Omit<
  EntryByIdResult,
  "originalReleaseDate"
> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type AddReleaseFormFormatInput = {
  id: string;
  formatId: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

export const defaultFormatInputRow = (): AddReleaseFormFormatInput =>
  withNewId({
    formatId: "",
    amount: "1",
    pictureSleeve: true,
    jukeboxHole: false,
  });

export const emptyCatalogueNumberInputValue = (): CatalogueNumberInputValue =>
  withNewId({ value: "" });

export type CountrySelectionInput = {
  id: string;
  codeName: string;
};

export type AddReleaseFormCountries = {
  madeIn: CountrySelectionInput[];
  printedIn: CountrySelectionInput[];
};

export const emptyCountrySelection = (): CountrySelectionInput =>
  withNewId({ codeName: "" });

export type CatalogueNumberInputValue = { id: string; value: string };
export type LabelInputValue = { id: string; name: string };

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

export const emptyLabelInputValue = (): LabelInputValue =>
  withNewId({ name: "" });

export const defaultCatalogueNumberRow = (): CatalogueNumberRowStateFlat =>
  withNewId({
    shape: "flat",
    labelInputValues: [emptyLabelInputValue()],
    catalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
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

  return {
    id: row.id,
    shape: "europeUk",
    labelInputValues: row.labelInputValues,
    europeCatalogueNumberInputValues:
      row.catalogueNumberInputValues.length > 0
        ? row.catalogueNumberInputValues
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

  return {
    id: row.id,
    shape: "flat",
    labelInputValues: row.labelInputValues,
    catalogueNumberInputValues: [
      ...row.europeCatalogueNumberInputValues,
      ...row.ukCatalogueNumberInputValues,
    ],
  };
};

export type AddReleaseFormMatrixRunoutDraft = {
  value: string;
  treatAsText: boolean;
};

export type AddReleaseFormFormatInputs = AddReleaseFormFormatInput[];
export type AddReleaseFormCatNumbersInputs = CatalogueNumberRowState[];

export type AddReleaseFormDraft = {
  name: FormField<AddReleaseFormNameInput, undefined>;
  releaseVersion: FormField;
  discogsUrl: FormField;
  releaseDate: FormField<GeneralizedDateFormInputValue>;
  countries: FormField<AddReleaseFormCountries, AddReleaseFormCountriesErrors>;
  formats: FormField<AddReleaseFormFormatInputs, AddReleaseFormFormatErrors>;
  catalogueNumbers: FormField<
    AddReleaseFormCatNumbersInputs,
    AddReleaseFormCatNumbersErrors
  >;
  matrixRunout: FormField<AddReleaseFormMatrixRunoutDraft>;
  selectedTags: FormField<Set<TagId>, undefined>;
  partOfQueenCollection: FormField<boolean, undefined>;
  relationToQueen: FormField<string, undefined>;
  comment: FormField<string, undefined>;
  conditionProblems: FormField<string, undefined>;
};

export const initialAddReleaseFormDraftValue = (
  entry: AddReleaseFormEntry,
  allFormats: ReleasesFormatListItem[],
): AddReleaseFormDraft => {
  const { mainName, originalReleaseDate, partOfQueenCollection } = entry;

  return {
    name: {
      value: defaultNameInput(mainName),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.name,
      notifications: [],
    },
    releaseVersion: {
      value: "",
      valid: true,
      validationFn: validateRequiredTrimmedText("Release version is required."),
      errors: initialAddReleaseFormFieldErrors.releaseVersion,
      notifications: [],
    },
    discogsUrl: {
      value: "https://www.discogs.com/release/<id>-...",
      valid: true,
      validationFn: validateDiscogsUrl,
      errors: initialAddReleaseFormFieldErrors.discogsUrl,
      notifications: [],
    },
    releaseDate: {
      value: {
        year: String(originalReleaseDate?.year ?? ""),
        month: String(originalReleaseDate?.month ?? ""),
        day: String(originalReleaseDate?.day ?? ""),
      },
      valid: true,
      validationFn: validateReleaseDate(originalReleaseDate),
      errors: initialAddReleaseFormFieldErrors.releaseDate,
      notifications: [],
    },
    countries: {
      value: {
        madeIn: [emptyCountrySelection()],
        printedIn: [],
      },
      valid: true,
      validationFn: validateReleaseCountries,
      errors: initialAddReleaseFormFieldErrors.countries,
      notifications: [],
    },
    formats: {
      value: [defaultFormatInputRow()],
      valid: true,
      validationFn: validateReleaseFormats(allFormats),
      errors: initialAddReleaseFormFieldErrors.formats,
      notifications: [],
    },
    catalogueNumbers: {
      value: [defaultCatalogueNumberRow()],
      valid: true,
      validationFn: validateReleaseCatNumbers,
      errors: initialAddReleaseFormFieldErrors.catalogueNumbers,
      notifications: [],
    },
    matrixRunout: {
      value: { value: "", treatAsText: false },
      valid: true,
      validationFn: validateReleaseMatrixRunout,
      errors: initialAddReleaseFormFieldErrors.matrixRunout,
      notifications: [],
    },
    selectedTags: {
      value: new Set<string>(),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.selectedTags,
      notifications: [],
    },
    partOfQueenCollection: {
      value: partOfQueenCollection,
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.partOfQueenCollection,
      notifications: [],
    },
    relationToQueen: {
      value: "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialAddReleaseFormFieldErrors.relationToQueen,
      notifications: [],
    },
    comment: {
      value: "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialAddReleaseFormFieldErrors.comment,
      notifications: [],
    },
    conditionProblems: {
      value: "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialAddReleaseFormFieldErrors.conditionProblems,
      notifications: [],
    },
  };
};

const validatePassThrough = <T>(
  value: T,
): FormFieldValidationResult<T, undefined> => {
  return {
    valid: true,
    value,
  };
};
