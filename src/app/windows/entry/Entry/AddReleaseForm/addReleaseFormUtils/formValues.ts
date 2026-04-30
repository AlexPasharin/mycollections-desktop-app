import { v4 as uuidv4 } from "uuid";

import type {
  AddReleaseFormCountriesErrors,
  AddReleaseFormFieldError,
} from "./errorMessages";
import { validateReleaseDate, validateReleaseVersion } from "./validation";
import { validateReleaseCountries } from "./validation/countries";
import type { FormFieldValidationResult } from "./validation/types";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";

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

type FormField<T, U> = {
  value: T;
  valid: boolean;
  validationFn: (value: T) => U;
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

  matrixRunout: AddReleaseFormMatrixRunoutDraft;
  formats: AddReleaseFormFormatInput[];
  catalogueNumbers: CatalogueNumberRowState[];
  selectedTags: Record<string, string>;
};

export const initialAddReleaseFormDraftValue = (
  originalReleaseDate: GeneralizedDate | null,
): AddReleaseFormDraft => ({
  releaseVersion: {
    value: "",
    valid: true,
    validationFn: validateReleaseVersion,
  },
  releaseDate: {
    value: {
      year: String(originalReleaseDate?.year ?? ""),
      month: String(originalReleaseDate?.month ?? ""),
      day: String(originalReleaseDate?.day ?? ""),
    },
    valid: true,
    validationFn: validateReleaseDate(originalReleaseDate),
  },
  countries: {
    value: {
      madeIn: [emptyCountrySelection()],
      printedIn: [],
    },
    valid: true,
    validationFn: validateReleaseCountries,
  },

  matrixRunout: { value: "", treatAsText: false },
  formats: [defaultFormatInputRow()],
  catalogueNumbers: [defaultCatalogueNumberRow()],
  selectedTags: {},
});
