import { type FC } from "react";

import styles from "./ReleaseCountries.module.css";

import { DetailField } from "../DetailField";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { CountryListItem } from "@/types/countries";
import type { ReleaseByIdResult } from "@/types/releases";
import { joinStringOrArray } from "@/utils/common";
import { countryCodesToNamesInReleaseCountries } from "@/utils/countries";
import type { CountriesBasic } from "@/validation";

type ReleaseCountriesProps = {
  releaseCountries: ReleaseByIdResult["countries"];
  allCountries: CountryListItem[];
};

const ReleaseCountries: FC<ReleaseCountriesProps> = ({
  releaseCountries,
  allCountries,
}) => {
  const displayCountries = resolveReleaseCountriesForDisplay(
    releaseCountries,
    allCountries,
  );

  return (
    <DetailField label={calcLabel(displayCountries)}>
      <ReleaseCountriesInner countries={displayCountries} />
    </DetailField>
  );
};

export default ReleaseCountries;

const ReleaseCountriesInner: FC<{
  countries: ReleaseByIdResult["countries"];
}> = ({ countries }) => {
  if (countries === null) {
    return "(Unknown)";
  }

  if (typeof countries === "string" || Array.isArray(countries)) {
    return joinStringOrArray(countries);
  }

  if ("CD" in countries) {
    const { CD, slipcase } = countries;

    return (
      <div className={styles.countriesCompound}>
        <div>
          <span className={styles.detailLabel}>CD:</span>
          <CountriesBasicBlock basic={CD} nested />
        </div>
        <DetailField label="Slipcase — printed in">
          {joinStringOrArray(slipcase["printed in"])}
        </DetailField>
      </div>
    );
  }

  if ("rawJson" in countries) {
    return (
      <DataWithErrorDisplay value={countries.rawJson} error={countries.error} />
    );
  }

  return <CountriesBasicBlock basic={countries} />;
};

type CountriesBasicBlockProps = {
  basic: CountriesBasic;
  nested?: boolean;
};

const CountriesBasicBlock: FC<CountriesBasicBlockProps> = ({
  basic,
  nested = false,
}) => {
  if (typeof basic === "string" || Array.isArray(basic)) {
    const text = joinStringOrArray(basic);
    const label = nested ? undefined : calcLabel(basic);

    return <DetailField label={label}>{text}</DetailField>;
  }

  return (
    <div className={styles.nestedCountriesBasic}>
      <DetailField label="Made in">
        {joinStringOrArray(basic["made in"])}
      </DetailField>
      <DetailField label="Printed in">
        {joinStringOrArray(basic["printed in"])}
      </DetailField>
    </div>
  );
};

const resolveReleaseCountriesForDisplay = (
  releaseCountries: ReleaseByIdResult["countries"],
  allCountries: CountryListItem[],
): ReleaseByIdResult["countries"] => {
  if (releaseCountries === null) {
    return null;
  }

  if (typeof releaseCountries === "object" && "rawJson" in releaseCountries) {
    return releaseCountries;
  }

  const codeToName = new Map(
    allCountries.map((country) => [country.codeName, country.name]),
  );

  try {
    return countryCodesToNamesInReleaseCountries(releaseCountries, codeToName);
  } catch {
    return releaseCountries;
  }
};

const calcLabel = (value: unknown) =>
  typeof value === "string" ? "Country" : "Countries";
