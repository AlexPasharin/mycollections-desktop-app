import { type FC } from "react";

import styles from "./DbSourcesCheckboxes.module.css";

import type { DbSource } from "@/db/db-source";
import { DB_SOURCE_OPTIONS } from "@/db/db-source-options";

type DbSourcesCheckboxesProps = {
  heading: string;
  headingId: string;
  idPrefix: string;
  activeDbSource: DbSource;
  checkedSources: ReadonlySet<DbSource>;
  onToggle: (source: DbSource) => void;
};

const DbSourcesCheckboxes: FC<DbSourcesCheckboxesProps> = ({
  heading,
  headingId,
  idPrefix,
  activeDbSource,
  checkedSources,
  onToggle,
}) => (
  <section className={styles.section} aria-labelledby={headingId}>
    <h3 id={headingId} className={styles.heading}>
      {heading}
    </h3>
    <ul className={styles.list}>
      {DB_SOURCE_OPTIONS.map(({ value, label }) => {
        const isActive = value === activeDbSource;
        const checkboxId = `${idPrefix}-${value}`;

        return (
          <li key={value} className={styles.checkboxRow}>
            <input
              id={checkboxId}
              type="checkbox"
              checked={checkedSources.has(value)}
              disabled={isActive}
              onChange={() => onToggle(value)}
            />
            <label
              htmlFor={checkboxId}
              className={
                isActive
                  ? `${styles.checkboxLabel} ${styles.checkboxLabelDisabled}`
                  : styles.checkboxLabel
              }
            >
              {label}
              {isActive && " (current)"}
            </label>
          </li>
        );
      })}
    </ul>
  </section>
);

export default DbSourcesCheckboxes;
