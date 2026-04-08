import type { FC } from "react";

import styles from "./DataWithErrorDisplay.module.css";

import { formatJson } from "@/utils/common";

export type DataWithErrorDisplayProps = {
  value: unknown;
  error: string;
};

const DataWithErrorDisplay: FC<DataWithErrorDisplayProps> = ({
  value,
  error,
}) => {
  const formatted = value == null ? String(value) : formatJson(value);

  return (
    <pre className={styles.jsonPre}>
      {formatted}
      <p className={styles.detailField}>Error: {error}</p>
    </pre>
  );
};

export default DataWithErrorDisplay;
