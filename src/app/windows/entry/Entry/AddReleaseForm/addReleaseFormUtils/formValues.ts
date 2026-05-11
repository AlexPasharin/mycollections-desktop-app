import { v4 as uuidv4 } from "uuid";

import type {
  AddReleaseFormCatNumbersErrors,
  AddReleaseFormCountriesErrors,
  AddReleaseFormFieldError,
  AddReleaseFormFormatErrors,
} from "./errorMessages";
import {
  validateReleaseDate,
  validateReleaseVersion,
  validateDiscogsUrl,
  validateOptionalTrimmedText,
  validateReleaseCountries,
  validateReleaseFormats,
  validateReleaseCatNumbers,
  validateReleaseMatrixRunout,
  type FormFieldValidationResult,
} from "./validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";
import type { EntryAltNameInfo, EntryByIdResult } from "@/types/entries";
import type { ReleasesFormatListItem } from "@/types/formats";

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

export const defaultFormatInputRow = (): AddReleaseFormFormatInput => ({
  id: uuidv4(),
  formatId: "",
  amount: "1",
  pictureSleeve: true,
  jukeboxHole: false,
});

export const emptyCatalogueNumberInputValue = () => ({
  id: uuidv4(),
  value: "",
});

export type CountrySelectionInput = {
  id: string;
  codeName: string;
};

export type AddReleaseFormCountries = {
  madeIn: CountrySelectionInput[];
  printedIn: CountrySelectionInput[];
};

export const emptyCountrySelection = () => ({
  id: uuidv4(),
  codeName: "",
});

export type CatalogueNumberRowState = {
  id: string;
  labelInputValues: {
    id: string;
    name: string;
  }[];
  catalogueNumberInputValues: {
    id: string;
    value: string;
  }[];
};

export const emptyLabelInputValue = () => ({
  id: uuidv4(),
  name: "",
});

export const defaultCatalogueNumberRow = (): CatalogueNumberRowState => ({
  id: uuidv4(),
  labelInputValues: [emptyLabelInputValue()],
  catalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
});

export type AddReleaseFormMatrixRunoutDraft = {
  value: string;
  treatAsText: boolean;
};

export type AddReleaseFormFormatInputs = AddReleaseFormFormatInput[];
export type AddReleaseFormCatNumbersInputs = CatalogueNumberRowState[];

type FormField<T, U> = {
  value: T;
  valid: boolean;
  validationFn: (value: T) => FormFieldValidationResult<T, U>;
  notifications: {
    notification: string;
  }[];
};

export type AddReleaseFormDraft = {
  name: FormField<AddReleaseFormNameInput, never>;
  releaseVersion: FormField<string, AddReleaseFormFieldError[]>;
  discogsUrl: FormField<string, AddReleaseFormFieldError[]>;
  releaseDate: FormField<
    GeneralizedDateFormInputValue,
    AddReleaseFormFieldError[]
  >;
  countries: FormField<AddReleaseFormCountries, AddReleaseFormCountriesErrors>;
  formats: FormField<AddReleaseFormFormatInputs, AddReleaseFormFormatErrors>;
  catalogueNumbers: FormField<
    AddReleaseFormCatNumbersInputs,
    AddReleaseFormCatNumbersErrors
  >;
  matrixRunout: FormField<
    AddReleaseFormMatrixRunoutDraft,
    AddReleaseFormFieldError[]
  >;
  selectedTags: FormField<Record<string, string>, never>;
  partOfQueenCollection: FormField<boolean, never>;
  relationToQueen: FormField<string, never>;
  comment: FormField<string, never>;
  conditionProblems: FormField<string, never>;
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
      notifications: [],
    },
    releaseVersion: {
      value: "",
      valid: true,
      validationFn: validateReleaseVersion,
      notifications: [],
    },
    discogsUrl: {
      value: "",
      valid: true,
      validationFn: validateDiscogsUrl,
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
      notifications: [],
    },
    countries: {
      value: {
        madeIn: [emptyCountrySelection()],
        printedIn: [],
      },
      valid: true,
      validationFn: validateReleaseCountries,
      notifications: [],
    },
    formats: {
      value: [defaultFormatInputRow()],
      valid: true,
      validationFn: validateReleaseFormats(allFormats),
      notifications: [],
    },
    catalogueNumbers: {
      value: [defaultCatalogueNumberRow()],
      valid: true,
      validationFn: validateReleaseCatNumbers,
      notifications: [],
    },
    matrixRunout: {
      value: { value: "", treatAsText: false },
      valid: true,
      validationFn: validateReleaseMatrixRunout,
      notifications: [],
    },
    selectedTags: {
      value: {},
      valid: true,
      validationFn: validatePassThrough,
      notifications: [],
    },
    partOfQueenCollection: {
      value: partOfQueenCollection,
      valid: true,
      validationFn: validatePassThrough,
      notifications: [],
    },
    relationToQueen: {
      value: "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      notifications: [],
    },
    comment: {
      value: "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      notifications: [],
    },
    conditionProblems: {
      value: "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      notifications: [],
    },
  };
};

const validatePassThrough = <T>(
  value: T,
): FormFieldValidationResult<T, never> => {
  return {
    valid: true,
    value,
  };
};
