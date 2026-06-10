import type { FC } from "react";

import styles from "./ReleaseMatrixRunout.module.css";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { JsonParsingErrorData, ReleaseByIdResult } from "@/types/releases";
import type { StringLeafJson } from "@/validation";

type ReleaseMatrixRunoutProps = {
  matrixRunout: ReleaseByIdResult["matrixRunout"];
};

const ReleaseMatrixRunout: FC<ReleaseMatrixRunoutProps> = ({ matrixRunout }) =>
  matrixRunout ? (
    <div className={styles.detailBlock}>
      <span className={styles.detailLabel}>Matrix / runout:</span>
      <div
        className={styles.objectPanel}
        role="region"
        aria-label="Matrix and runout structure"
      >
        <MatrixRunoutValueView value={matrixRunout} depth={0} />
      </div>
    </div>
  ) : null;

export default ReleaseMatrixRunout;

const MatrixRunoutValueView: FC<{
  value: StringLeafJson | JsonParsingErrorData;
  depth: number;
}> = ({ value, depth }) => {
  if (isJsonParsingErrorData(value)) {
    return (
      <div className={styles.parseErrorShell}>
        <DataWithErrorDisplay value={value.rawJson} error={value.error} />
      </div>
    );
  }

  if (typeof value === "string") {
    return <code className={styles.codeString}>{value}</code>;
  }

  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className={depth === 0 ? styles.objectRoot : styles.nestedBlock}>
      {entries.map(([key, nested]) => (
        <div key={key} className={styles.kvRow}>
          <div className={styles.kvKey}>{key}</div>
          <div className={styles.kvValue}>
            <MatrixRunoutValueView value={nested} depth={depth + 1} />
          </div>
        </div>
      ))}
    </div>
  );
};

const isJsonParsingErrorData = (
  v: StringLeafJson | JsonParsingErrorData,
): v is JsonParsingErrorData =>
  typeof v === "object" &&
  !Array.isArray(v) &&
  "rawJson" in v &&
  typeof v.error === "string";
