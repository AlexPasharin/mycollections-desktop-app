import type { FC, ReactNode } from "react";

import styles from "./ReleaseMatrixRunout.module.css";

import JsonFieldErrorDisplay from "../JsonFieldErrorDisplay";

import type { ReleaseByIdResult } from "@/types/releases";

type ReleaseMatrixRunoutProps = {
  matrixRunout: ReleaseByIdResult["matrixRunout"];
};

const ReleaseMatrixRunout: FC<ReleaseMatrixRunoutProps> = ({
  matrixRunout,
}) => {
  if (matrixRunout === null) {
    return null;
  }

  if (typeof matrixRunout === "string") {
    return (
      <MatrixRunoutDetailBlock>
        <div
          className={styles.stringShell}
          role="region"
          aria-label="Matrix and runout text"
        >
          <code className={styles.codeBlock}>{matrixRunout}</code>
        </div>
      </MatrixRunoutDetailBlock>
    );
  }

  if ("rawJson" in matrixRunout) {
    return (
      <MatrixRunoutDetailBlock>
        <div className={styles.parseErrorShell}>
          <JsonFieldErrorDisplay
            rawJson={matrixRunout.rawJson}
            error={String(matrixRunout.error)}
          />
        </div>
      </MatrixRunoutDetailBlock>
    );
  }

  return (
    <MatrixRunoutDetailBlock>
      <div
        className={styles.objectPanel}
        role="region"
        aria-label="Matrix and runout structure"
      >
        <MatrixRunoutValueView value={matrixRunout} depth={0} />
      </div>
    </MatrixRunoutDetailBlock>
  );
};

const MatrixRunoutDetailBlock: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.detailBlock}>
    <span className={styles.detailLabel}>Matrix / runout:</span>
    {children}
  </div>
);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const MatrixRunoutValueView: FC<{
  value: unknown;
  depth: number;
}> = ({ value, depth }) => {
  if (value === null || value === undefined) {
    return <span className={styles.nullValue}>—</span>;
  }

  if (typeof value === "string") {
    return <code className={styles.codeString}>{value}</code>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span className={styles.scalar}>{String(value)}</span>;
  }

  if (typeof value === "bigint") {
    return <span className={styles.scalar}>{value.toString()}</span>;
  }

  if (typeof value === "symbol") {
    return <span className={styles.scalar}>{value.toString()}</span>;
  }

  if (Array.isArray(value)) {
    const items = value as unknown[];

    if (items.length === 0) {
      return <span className={styles.nullValue}>(empty)</span>;
    }

    return (
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index}>
            <MatrixRunoutValueView value={item} depth={depth} />
          </li>
        ))}
      </ul>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <span className={styles.nullValue}>{`{ }`}</span>;
    }

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
  }

  return (
    <span className={styles.scalar}>
      {typeof value === "function" ? "[function]" : JSON.stringify(value)}
    </span>
  );
};

export default ReleaseMatrixRunout;
