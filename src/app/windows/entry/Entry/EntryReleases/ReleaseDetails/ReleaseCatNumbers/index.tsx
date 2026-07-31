import type { FC } from "react";

import styles from "./ReleaseCatNumbers.module.css";

import { DetailField } from "../DetailField";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { ReleaseByIdResult } from "@/types/releases";
import { joinStringOrArray } from "@/utils/common";
import {
  isReleaseCatNumbersFormatKeysCase,
  type CatNumbersNested,
  type CatNumbersProperty,
  type ReleaseCatNumbersStandardKeysCase,
  type ReleaseCatNumbersFormatKeysCase,
  type ReleaseCatNumbersSingle,
} from "@/validation";

type ReleaseCatNumbersProps = {
  catalogueNumbers: ReleaseByIdResult["catalogueNumbers"];
};

const ReleaseCatNumbers: FC<ReleaseCatNumbersProps> = ({
  catalogueNumbers,
}) => {
  if (catalogueNumbers === null) {
    return null;
  }

  return (
    <div className={styles.detailBlock}>
      <span className={styles.detailLabel}>Catalogue numbers:</span>
      <ReleaseCatNumbersInner catalogueNumbers={catalogueNumbers} />
    </div>
  );
};

export default ReleaseCatNumbers;

type CatalogueNumbersDisplayed = Exclude<
  ReleaseByIdResult["catalogueNumbers"],
  null
>;

const isCatNumbersJsonParsingError = (
  value: CatalogueNumbersDisplayed,
): value is Extract<CatalogueNumbersDisplayed, { rawJson: unknown }> =>
  !Array.isArray(value) &&
  !isReleaseCatNumbersFormatKeysCase(value) &&
  "rawJson" in value &&
  "error" in value;

const ReleaseCatNumbersInner: FC<{
  catalogueNumbers: CatalogueNumbersDisplayed;
}> = ({ catalogueNumbers }) => {
  if (isCatNumbersJsonParsingError(catalogueNumbers)) {
    return (
      <DataWithErrorDisplay
        value={catalogueNumbers.rawJson}
        error={catalogueNumbers.error}
      />
    );
  }

  if (isReleaseCatNumbersFormatKeysCase(catalogueNumbers)) {
    return <FormatKeysCaseBlock value={catalogueNumbers} />;
  }

  return <StandardCatNumbersShapeBlock value={catalogueNumbers} />;
};

const FormatKeysCaseBlock: FC<{ value: ReleaseCatNumbersFormatKeysCase }> = ({
  value,
}) => (
  <div className={styles.catNumbersCompound}>
    {Object.entries(value).map(([formatKey, formatValue]) => (
      <div key={formatKey}>
        <span className={styles.detailLabel}>{formatKey}: </span>
        <StandardCatNumbersShapeBlock value={formatValue} />
      </div>
    ))}
  </div>
);

const StandardCatNumbersShapeBlock: FC<{
  value: ReleaseCatNumbersStandardKeysCase;
}> = ({ value }) => {
  if (Array.isArray(value)) {
    return (
      <ul className={styles.entriesList}>
        {value.map((entry, index) => (
          <li key={index} className={styles.entryItem}>
            <CatNumbersSingle value={entry} />
          </li>
        ))}
      </ul>
    );
  }

  return <CatNumbersSingle value={value} />;
};

const CatNumbersSingle: FC<{ value: ReleaseCatNumbersSingle }> = ({
  value,
}) => (
  <div className={styles.catNumbersSingle}>
    {"label" in value && <DetailField label="Label">{value.label}</DetailField>}
    {"labels" in value && (
      <DetailField label="Labels">
        {joinStringOrArray(value.labels)}
      </DetailField>
    )}
    {"cat_number" in value && (
      <DetailField label="Cat. number">{value.cat_number}</DetailField>
    )}
    {"cat_numbers" in value && (
      <DetailField label="Cat. numbers">
        <CatNumbersPropertyBlock value={value.cat_numbers} />
      </DetailField>
    )}
  </div>
);

const CatNumbersPropertyBlock: FC<{ value: CatNumbersProperty }> = ({
  value,
}) => {
  if (typeof value === "string" || Array.isArray(value)) {
    return joinStringOrArray(value);
  }

  if ("in UK" in value) {
    return (
      <div className={styles.nestedRegions}>
        <DetailField label="In Europe">
          {joinStringOrArray(value["in Europe"])}
        </DetailField>
        <DetailField label="In UK">
          {joinStringOrArray(value["in UK"])}
        </DetailField>
      </div>
    );
  }

  if ("CD" in value) {
    const { CD, slipcase } = value;

    return (
      <div className={styles.catNumbersCompound}>
        <div>
          <span className={styles.detailLabel}>CD: </span>
          <CatNumbersNestedBlock value={CD} />
        </div>
        <div>
          <span className={styles.detailLabel}>Slipcase: </span>
          <CatNumbersNestedBlock value={slipcase} />
        </div>
      </div>
    );
  }

  return null;
};

const CatNumbersNestedBlock: FC<{ value: CatNumbersNested }> = ({ value }) => {
  if (typeof value === "string" || Array.isArray(value)) {
    return joinStringOrArray(value);
  }

  return (
    <div className={styles.nestedRegions}>
      <DetailField label="In Europe">
        {joinStringOrArray(value["in Europe"])}
      </DetailField>
      <DetailField label="In UK">
        {joinStringOrArray(value["in UK"])}
      </DetailField>
    </div>
  );
};
