import type { FC, PropsWithChildren } from "react";

import styles from "./ReleaseCountries.module.css";

import { formatJson } from "../formatJson";

import type { ReleaseByIdResult } from "@/types/releases";
import type { CountriesBasic } from "@/validation/releases/countries";

type ReleaseCountriesProps = {
  countries: ReleaseByIdResult["countries"];
};

const ReleaseCountries: FC<ReleaseCountriesProps> = ({ countries }) => (
  <DetailField label={calcLabel(countries)}>
    <ReleaseCountriesInner countries={countries} />
  </DetailField>
);

const ReleaseCountriesInner: FC<ReleaseCountriesProps> = ({ countries }) => {
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
    const { rawJson, error } = countries;

    return (
      <>
        <pre className={styles.jsonPre}>{formatJson(rawJson)}</pre>
        <p className={styles.detailField}>Error: {error}</p>
      </>
    );
  }

  return <CountriesBasicBlock basic={countries} />;
};

export default ReleaseCountries;

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

type DetailFieldProps = PropsWithChildren<{
  label: string | undefined;
}>;

const DetailField: FC<DetailFieldProps> = ({ label, children }) => (
  <div className={styles.detailField}>
    {label === undefined ? (
      children
    ) : (
      <>
        <span className={styles.detailLabel}>{label}: </span>
        {children}
      </>
    )}
  </div>
);

const calcLabel = (value: unknown) =>
  typeof value === "string" ? "Country" : "Countries";

const joinStringOrArray = (v: string | string[]): string =>
  Array.isArray(v) ? v.join(", ") : v;
