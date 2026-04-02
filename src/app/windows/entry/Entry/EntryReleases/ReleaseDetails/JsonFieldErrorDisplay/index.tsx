import type { FC } from "react";

import styles from "./JsonFieldErrorDisplay.module.css";

import type { JsonParsingErrorData } from "@/types/releases";
import { formatJson } from "@/utils/common";

const JsonFieldErrorDisplay: FC<JsonParsingErrorData> = ({
  rawJson,
  error,
}) => {
  const jsonFormatted = rawJson == null ? String(rawJson) : formatJson(rawJson);

  return (
    <pre className={styles.jsonPre}>
      {jsonFormatted}
      <p className={styles.detailField}>Error: {error}</p>
    </pre>
  );
};

export default JsonFieldErrorDisplay;
