import type { FC } from "react";

import styles from "./ReleaseCatNumbers.module.css";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { ReleaseByIdResultCatalogueNumbers } from "@/types/releases";
import { joinStringOrArray } from "@/utils/common";

type ReleaseCatNumbersProps = {
  catalogueNumbers: ReleaseByIdResultCatalogueNumbers;
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
      <div
        className={styles.objectPanel}
        role="region"
        aria-label="Catalogue numbers structure"
      >
        <ReleaseCatNumbersInner catalogueNumbers={catalogueNumbers} />
      </div>
    </div>
  );
};

export default ReleaseCatNumbers;

type ReleaseCatNumberPropertyValue =
  | string
  | {
      [k: string]: ReleaseCatNumberGeneral;
    };

type ReleaseCatNumberGeneral =
  | ReleaseCatNumberPropertyValue
  | ReleaseCatNumberPropertyValue[];

const ReleaseCatNumbersInner: FC<{
  catalogueNumbers: Exclude<ReleaseByIdResultCatalogueNumbers, null>;
}> = ({ catalogueNumbers }) => {
  if (!("type" in catalogueNumbers)) {
    return (
      <div className={styles.parseErrorShell}>
        <DataWithErrorDisplay
          value={catalogueNumbers.rawJson}
          error={catalogueNumbers.error}
        />
      </div>
    );
  }

  return (
    <ReleaseCatNumbersGeneralBlock value={catalogueNumbers.value} depth={0} />
  );
};

const ReleaseCatNumbersGeneralBlock: FC<{
  value: ReleaseCatNumberGeneral;
  depth: number;
}> = ({ value, depth }) => {
  if (typeof value === "string" || isStringArray(value)) {
    return <span className={styles.leafValue}>{joinStringOrArray(value)}</span>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className={styles.entriesList}>
        {value.map((entry, index) => (
          <li key={index} className={styles.entryItem}>
            <ReleaseCatNumbersGeneralBlock value={entry} depth={depth} />
          </li>
        ))}
      </ul>
    );
  }

  const objectClassName = depth === 0 ? styles.objectRoot : styles.nestedBlock;

  return (
    <div className={objectClassName}>
      {Object.entries(value).map(([key, nestedValue]) => (
        <div key={key} className={styles.kvRow}>
          <div className={styles.kvKey}>{prettifyCatNumberKey(key)}</div>
          <div className={styles.kvValue}>
            <ReleaseCatNumbersGeneralBlock
              value={nestedValue}
              depth={depth + 1}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const isStringArray = (value: ReleaseCatNumberGeneral) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const CAT_NUMBER_KEY_LABELS: Record<string, string> = {
  label: "Label",
  labels: "Labels",
  cat_number: "Cat. number",
  cat_numbers: "Cat. numbers",
};

const prettifyCatNumberKey = (key: string): string =>
  CAT_NUMBER_KEY_LABELS[key] ?? key;
