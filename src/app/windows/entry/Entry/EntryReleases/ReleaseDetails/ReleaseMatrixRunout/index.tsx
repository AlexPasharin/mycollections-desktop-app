import type { FC } from "react";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { JsonParsingErrorData, ReleaseByIdResult } from "@/types/releases";
import type { StringLeafJson } from "@/validation";

type ReleaseMatrixRunoutProps = {
  matrixRunout: ReleaseByIdResult["matrixRunout"];
};

const ReleaseMatrixRunout: FC<ReleaseMatrixRunoutProps> = ({ matrixRunout }) =>
  matrixRunout ? (
    <div className="m-0 mb-[0.55rem]">
      <span className="mb-[0.35rem] block font-semibold">Matrix / runout:</span>
      <div
        className="mt-[0.15rem] rounded-md border border-[#e8e8e8] bg-[#f8f9fa] p-[0.5rem_0.65rem]"
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
      <div className="mt-[0.15rem] rounded-md border border-l-4 border-[#e8c4c4] border-l-[#c62828] bg-[#fff8f8] p-[0.5rem_0.65rem] [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:border-none [&_pre]:bg-transparent [&_pre]:p-0">
        <DataWithErrorDisplay value={value.rawJson} error={value.error} />
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <code className="rounded-[3px] border border-gray-200 bg-white px-[0.1rem] py-[0.1rem] font-mono text-[0.82rem] break-words">
        {value}
      </code>
    );
  }

  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div
      className={
        depth === 0
          ? "flex flex-col gap-[0.4rem]"
          : "mt-[0.15rem] flex flex-col gap-[0.35rem] border-l-2 border-[#d0d7de] pl-[0.65rem]"
      }
    >
      {entries.map(([key, nested]) => (
        <div
          key={key}
          className="grid grid-cols-[minmax(5.5rem,max-content)_1fr] items-start gap-x-3 gap-y-2 max-[520px]:grid-cols-1 max-[520px]:gap-[0.2rem]"
        >
          <div className="shrink-0 text-[0.82rem] leading-[1.35] font-semibold text-gray-700">
            {key}
          </div>
          <div className="min-w-0 text-[0.82rem] leading-[1.4]">
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
