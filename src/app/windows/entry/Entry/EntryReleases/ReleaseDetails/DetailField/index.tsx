import type { FC, PropsWithChildren } from "react";

import styles from "./DetailField.module.css";

type DetailFieldProps = PropsWithChildren<{
  label: string | undefined;
}>;

export const DetailField: FC<DetailFieldProps> = ({ label, children }) => (
  <div className={styles.detailField}>
    {label !== undefined && (
      <span className={styles.detailLabel}>{label}: </span>
    )}
    {children}
  </div>
);
