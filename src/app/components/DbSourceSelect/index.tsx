import { type FC } from "react";

import styles from "./DbSourceSelect.module.css";

import type { DbSource } from "@/db/db-source";
import { DB_SOURCE_OPTIONS } from "@/db/db-source-options";

type DbSourceSelectProps = {
  id: string;
  value: DbSource;
  onChange: (source: DbSource) => void;
};

const DbSourceSelect: FC<DbSourceSelectProps> = ({ id, value, onChange }) => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor={id}>
      Database
    </label>
    <select
      id={id}
      className={styles.select}
      value={value}
      onChange={(event) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- options are DbSource values only
        onChange(event.target.value as DbSource);
      }}
    >
      {DB_SOURCE_OPTIONS.map(({ value: optionValue, label }) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  </div>
);

export default DbSourceSelect;
