import type { ReleaseFormTabMode } from "../../../types";

import type { CountryListItem } from "@/types/countries";
import type { JsonParsingErrorData, ReleaseByIdResult } from "@/types/releases";
import { valueToArray } from "@/utils/common";
import { withNewId } from "@/utils/id";

export const buildCountryLookup = (allCountries: CountryListItem[]) => {
  const codeNames = new Set(allCountries.map((country) => country.codeName));

  return (values: string[]): CountrySelectionInput[] =>
    values
      .filter((value) => codeNames.has(value))
      .map((codeName) => withNewId({ codeName }));
};

export type CountrySelectionInput = {
  id: string;
  codeName: string;
};

export type ReleaseFormCountries = {
  madeIn: CountrySelectionInput[];
  printedIn: CountrySelectionInput[];
};

export const emptyCountrySelection = (): CountrySelectionInput =>
  withNewId({ codeName: "" });

export const isCountriesJsonParsingError = (
  countries: ReleaseByIdResult["countries"],
): countries is JsonParsingErrorData =>
  typeof countries === "object" &&
  countries !== null &&
  !Array.isArray(countries) &&
  "rawJson" in countries &&
  "error" in countries &&
  typeof countries.error === "string";

export const countriesToFormValue = (
  countries: ReleaseByIdResult["countries"] | undefined,
  allCountries: CountryListItem[],
  mode: ReleaseFormTabMode,
): ReleaseFormCountries => {
  if (countries == null || isCountriesJsonParsingError(countries)) {
    return mode === "update"
      ? { madeIn: [], printedIn: [] }
      : { madeIn: [emptyCountrySelection()], printedIn: [] };
  }

  const basic =
    typeof countries === "object" && "CD" in countries
      ? countries.CD
      : countries;

  const countryLookup = buildCountryLookup(allCountries);

  if (typeof basic === "string" || Array.isArray(basic)) {
    const madeIn = countryLookup(valueToArray(basic));

    return {
      madeIn: madeIn.length > 0 ? madeIn : [emptyCountrySelection()],
      printedIn: [],
    };
  }

  const madeIn = countryLookup(valueToArray(basic["made in"]));
  const printedIn = countryLookup(valueToArray(basic["printed in"]));

  return {
    madeIn: madeIn.length > 0 ? madeIn : [emptyCountrySelection()],
    printedIn,
  };
};
