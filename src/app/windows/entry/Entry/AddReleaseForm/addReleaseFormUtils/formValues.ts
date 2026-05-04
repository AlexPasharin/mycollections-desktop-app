import { v4 as uuidv4 } from "uuid";

import type {
  AddReleaseFormCatNumbersErrors,
  AddReleaseFormCountriesErrors,
  AddReleaseFormFieldError,
  AddReleaseFormFormatErrors,
} from "./errorMessages";
import { validateReleaseDate, validateReleaseVersion } from "./validation";
import { validateReleaseCatNumbers } from "./validation/catalogueNumbers";
import { validateReleaseCountries } from "./validation/countries";
import { validateReleaseFormats } from "./validation/formats";
import type { FormFieldValidationResult } from "./validation/types";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";
import type { ReleasesFormatListItem } from "@/types/formats";

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
  validationFn: (value: T) => U;
  notifications: {
    notification: string;
  }[];
};

export type AddReleaseFormDraft = {
  releaseVersion: FormField<
    string,
    FormFieldValidationResult<string, AddReleaseFormFieldError[] | undefined>
  >;
  releaseDate: FormField<
    GeneralizedDateFormInputValue,
    FormFieldValidationResult<
      GeneralizedDateFormInputValue,
      AddReleaseFormFieldError[] | undefined
    >
  >;
  countries: FormField<
    AddReleaseFormCountries,
    FormFieldValidationResult<
      AddReleaseFormCountries,
      AddReleaseFormCountriesErrors
    >
  >;
  formats: FormField<
    AddReleaseFormFormatInputs,
    FormFieldValidationResult<
      AddReleaseFormFormatInputs,
      AddReleaseFormFormatErrors
    >
  >;
  catalogueNumbers: FormField<
    AddReleaseFormCatNumbersInputs,
    FormFieldValidationResult<
      AddReleaseFormCatNumbersInputs,
      AddReleaseFormCatNumbersErrors
    >
  >;

  matrixRunout: AddReleaseFormMatrixRunoutDraft;
  selectedTags: Record<string, string>;
};

export const initialAddReleaseFormDraftValue = (
  originalReleaseDate: GeneralizedDate | null,
  allFormats: ReleasesFormatListItem[],
): AddReleaseFormDraft => ({
  releaseVersion: {
    value: "",
    valid: true,
    validationFn: validateReleaseVersion,
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

  matrixRunout: { value: "", treatAsText: false },

  selectedTags: {},
});
