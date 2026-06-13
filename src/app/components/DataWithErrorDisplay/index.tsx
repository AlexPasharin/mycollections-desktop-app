import type { FC } from "react";

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
    <pre className="mt-2 overflow-x-auto rounded bg-neutral-100 px-[0.55rem] py-[0.45rem] text-[0.82rem] leading-[1.35] break-words whitespace-pre-wrap">
      {formatted}
      <p className="mb-2">Error: {error}</p>
    </pre>
  );
};

export default DataWithErrorDisplay;
