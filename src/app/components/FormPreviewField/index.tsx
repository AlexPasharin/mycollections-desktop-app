import type { FC, ReactNode } from "react";

export type FormPreviewFieldProps = {
  label: string;
  children: ReactNode;
};

const FormPreviewField: FC<FormPreviewFieldProps> = ({ label, children }) => (
  <p className="m-0">
    <span className="mr-[0.4rem] font-semibold">{label}:</span>
    {children}
  </p>
);

export default FormPreviewField;

export const FormPreviewBlockField: FC<FormPreviewFieldProps> = ({
  label,
  children,
}) => (
  <div className="m-0">
    <span className="mb-1 font-semibold">{label}:</span>
    {children}
  </div>
);
