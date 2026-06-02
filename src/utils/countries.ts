import { flattenStringOrArray } from "@/utils/common";
import type { CountriesBasic, ReleaseCountries } from "@/validation";

/** Country codes from validated release `countries` JSON, deduplicated. */
export const collectReleaseCountryCodes = (
  data: ReleaseCountries,
): string[] => {
  if (data === null) {
    return [];
  }

  const collected =
    typeof data === "object" && "CD" in data
      ? [
          ...collectFromCountriesBasic(data.CD),
          ...flattenStringOrArray(data.slipcase["printed in"]),
        ]
      : collectFromCountriesBasic(data);

  return [...new Set(collected)];
};

const collectFromCountriesBasic = (basic: CountriesBasic): string[] => {
  if (typeof basic === "string" || Array.isArray(basic)) {
    return flattenStringOrArray(basic);
  }

  return [
    ...flattenStringOrArray(basic["made in"]),
    ...flattenStringOrArray(basic["printed in"]),
  ];
};

export const countryCodesToNamesInReleaseCountries = (
  countries: ReleaseCountries,
  codeToName: ReadonlyMap<string, string>,
): ReleaseCountries => {
  if (countries === null) {
    return null;
  }

  if (typeof countries === "object" && "CD" in countries) {
    return {
      CD: substituteCountriesBasic(countries.CD, codeToName),
      slipcase: {
        "printed in": countryCodesToNames(
          countries.slipcase["printed in"],
          codeToName,
        ),
      },
    };
  }

  return substituteCountriesBasic(countries, codeToName);
};

const countryCodeToName = (
  code: string,
  codeToName: ReadonlyMap<string, string>,
): string => {
  const name = codeToName.get(code);

  if (name === undefined) {
    // SHOULD NOT NORMALLY HAPPEN BC OF TRIGGERS ON COUNTRIES AND MUSICAL_RELEASES TABLES
    throw new Error(`No country name in map for code "${code}"`);
  }

  return name;
};

const countryCodesToNames = (
  value: string | string[],
  codeToName: ReadonlyMap<string, string>,
): string | string[] =>
  typeof value === "string"
    ? countryCodeToName(value, codeToName)
    : value.map((v) => countryCodeToName(v, codeToName));

const substituteCountriesBasic = (
  basic: CountriesBasic,
  codeToName: ReadonlyMap<string, string>,
): CountriesBasic => {
  if (typeof basic === "string" || Array.isArray(basic)) {
    return countryCodesToNames(basic, codeToName);
  }

  return {
    "made in": countryCodesToNames(basic["made in"], codeToName),
    "printed in": countryCodesToNames(basic["printed in"], codeToName),
  };
};
