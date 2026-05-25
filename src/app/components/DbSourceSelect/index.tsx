import { type FC } from "react";

import styles from "./DbSourceSelect.module.css";

import { DbSource } from "@/db/db-source";

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

const DB_SOURCE_OPTIONS: ReadonlyArray<{ value: DbSource; label: string }> = [
  { value: DbSource.LocalDevDb, label: "Local dev" },
  { value: DbSource.LocalProdDb, label: "Local prod" },
  { value: DbSource.RemoteProdDb, label: "Remote prod" },
];
