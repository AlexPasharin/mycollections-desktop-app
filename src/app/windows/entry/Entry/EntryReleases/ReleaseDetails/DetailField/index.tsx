import type { FC, PropsWithChildren } from "react";

type DetailFieldProps = PropsWithChildren<{
  label: string | undefined;
}>;

export const DetailField: FC<DetailFieldProps> = ({ label, children }) => (
  <div className="mb-2">
    {label !== undefined && <span className="font-semibold">{label}: </span>}
    {children}
  </div>
);
