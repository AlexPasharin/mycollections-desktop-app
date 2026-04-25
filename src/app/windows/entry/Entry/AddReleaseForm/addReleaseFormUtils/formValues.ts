import { v4 as uuidv4 } from "uuid";

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

export const emptyCountrySelection = (): CountrySelectionInput => ({
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

export type AddReleaseFormDraft = {
  releaseVersion: string;
  matrixRunout: AddReleaseFormMatrixRunoutDraft;
  releaseDate: GeneralizedDateFormInputValue;
  formats: AddReleaseFormFormatInput[];
  catalogueNumbers: CatalogueNumberRowState[];
  selectedTags: Record<string, string>;
  countrySelections: CountrySelectionInput[];
  printedInCountrySelections: CountrySelectionInput[];
};

export const initialAddReleaseFormDraftValue = (
  originalReleaseDate: GeneralizedDate | null,
): AddReleaseFormDraft => ({
  releaseVersion: "",
  matrixRunout: { value: "", treatAsText: false },
  releaseDate: {
    year: String(originalReleaseDate?.year ?? ""),
    month: String(originalReleaseDate?.month ?? ""),
    day: String(originalReleaseDate?.day ?? ""),
  },
  formats: [defaultFormatInputRow()],
  catalogueNumbers: [defaultCatalogueNumberRow()],
  selectedTags: {},
  countrySelections: [emptyCountrySelection()],
  printedInCountrySelections: [],
});
