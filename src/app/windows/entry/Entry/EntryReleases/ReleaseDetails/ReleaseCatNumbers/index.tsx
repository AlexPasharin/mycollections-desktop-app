import type { FC } from "react";

import styles from "./ReleaseCatNumbers.module.css";

import { DetailField } from "../DetailField";
import JsonFieldErrorDisplay from "../JsonFieldErrorDisplay";

import type { ReleaseByIdResult } from "@/types/releases";
import { joinStringOrArray } from "@/utils/common";
import type {
  CatNumbersNested,
  CatNumbersProperty,
  ReleaseCatNumbersSingle,
} from "@/validation/releases/cat_numbers";

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

const ReleaseCatNumbersInner: FC<{
  catalogueNumbers: CatalogueNumbersDisplayed;
}> = ({ catalogueNumbers }) => {
  if ("rawJson" in catalogueNumbers) {
    return <JsonFieldErrorDisplay {...catalogueNumbers} />;
  }

  if (Array.isArray(catalogueNumbers)) {
    return (
      <ul className={styles.entriesList}>
        {catalogueNumbers.map((entry, index) => (
          <li key={index} className={styles.entryItem}>
            <CatNumbersSingle value={entry} />
          </li>
        ))}
      </ul>
    );
  }

  return <CatNumbersSingle value={catalogueNumbers} />;
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
