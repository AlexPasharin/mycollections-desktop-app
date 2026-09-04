import type { FC, ReactNode } from "react";

import { formatJson } from "@/utils/common";
import { orPlaceholder } from "@/utils/form";

export type FormPreviewFieldProps = {
  label: string;
  children: ReactNode;
};

const FormPreviewField: FC<FormPreviewFieldProps> = ({ label, children }) => (
  <div className="m-0">
    <span className="mr-[0.4rem] font-semibold">{label}:</span>
    {typeof children === "string" || children == null
      ? orPlaceholder(children)
      : children}
  </div>
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

type JsonFieldProps = {
  label: string;
  value: unknown;
};

export const JsonField: FC<JsonFieldProps> = ({ label, value }) => (
  <FormPreviewField label={label}>
    {value === null || (typeof value === "string" && !value.trim()) ? null : (
      <pre className="mt-[0.15rem] rounded-[6px] border border-[#e0dcf5] bg-[#f7f6fb] px-[0.7rem] py-[0.55rem] font-mono text-[0.85em] break-words whitespace-pre-wrap">
        {formatJson(value)}
      </pre>
    )}
  </FormPreviewField>
);
