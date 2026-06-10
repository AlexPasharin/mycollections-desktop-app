import type { FC, ReactNode } from "react";

import styles from "./FormPreviewField.module.css";

export type FormPreviewFieldProps = {
  label: string;
  children: ReactNode;
};

const FormPreviewField: FC<FormPreviewFieldProps> = ({ label, children }) => (
  <p className={styles.field}>
    <span className={styles.label}>{label}:</span>
    {children}
  </p>
);

export default FormPreviewField;

export const FormPreviewBlockField: FC<FormPreviewFieldProps> = ({
  label,
  children,
}) => (
  <div className={styles.field}>
    <span className={styles.labelBlock}>{label}:</span>
    {children}
  </div>
);
