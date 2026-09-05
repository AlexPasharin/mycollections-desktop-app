import type { FC } from "react";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { ReleaseByIdResultCatalogueNumbers } from "@/types/releases";
import { joinStringOrArray } from "@/utils/common";

type ReleaseCatNumbersProps = {
  catalogueNumbers: ReleaseByIdResultCatalogueNumbers;
};

const ReleaseCatNumbers: FC<ReleaseCatNumbersProps> = ({
  catalogueNumbers,
}) => {
  if (catalogueNumbers === null) {
    return null;
  }

  return (
    <div className="m-0 mb-[0.55rem]">
      <span className="mb-[0.35rem] block font-semibold">
        Catalogue numbers:
      </span>
      <div
        className="mt-[0.15rem] rounded-md border border-[#e8e8e8] bg-[#f8f9fa] p-[0.5rem_0.65rem]"
        role="region"
        aria-label="Catalogue numbers structure"
      >
        <ReleaseCatNumbersInner catalogueNumbers={catalogueNumbers} />
      </div>
    </div>
  );
};

export default ReleaseCatNumbers;

type ReleaseCatNumberPropertyValue =
  | string
  | {
      [k: string]: ReleaseCatNumberGeneral;
    };

type ReleaseCatNumberGeneral =
  | ReleaseCatNumberPropertyValue
  | ReleaseCatNumberPropertyValue[];

const ReleaseCatNumbersInner: FC<{
  catalogueNumbers: Exclude<ReleaseByIdResultCatalogueNumbers, null>;
}> = ({ catalogueNumbers }) => {
  if (!("type" in catalogueNumbers)) {
    return (
      <div className="mt-[0.15rem] rounded-md border border-l-4 border-[#e8c4c4] border-l-[#c62828] bg-[#fff8f8] p-[0.5rem_0.65rem] [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:border-none [&_pre]:bg-transparent [&_pre]:p-0">
        <DataWithErrorDisplay
          value={catalogueNumbers.rawJson}
          error={catalogueNumbers.error}
        />
      </div>
    );
  }

  return (
    <ReleaseCatNumbersGeneralBlock value={catalogueNumbers.value} depth={0} />
  );
};

const ReleaseCatNumbersGeneralBlock: FC<{
  value: ReleaseCatNumberGeneral;
  depth: number;
}> = ({ value, depth }) => {
  if (typeof value === "string" || isStringArray(value)) {
    return (
      <span className="text-[0.82rem] leading-[1.4] break-words">
        {joinStringOrArray(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="mt-1 mb-0 pl-[1.1rem]">
        {value.map((entry, index) => (
          <li key={index} className="my-[0.35rem]">
            <ReleaseCatNumbersGeneralBlock value={entry} depth={depth} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={
        depth === 0
          ? "flex flex-col gap-[0.4rem]"
          : "mt-[0.15rem] flex flex-col gap-[0.35rem] border-l-2 border-[#d0d7de] pl-[0.65rem]"
      }
    >
      {Object.entries(value).map(([key, nestedValue]) => (
        <div
          key={key}
          className="grid grid-cols-[minmax(5.5rem,max-content)_1fr] items-start gap-x-3 gap-y-2 max-[520px]:grid-cols-1 max-[520px]:gap-[0.2rem]"
        >
          <div className="shrink-0 text-[0.82rem] leading-[1.35] font-semibold text-gray-700">
            {prettifyCatNumberKey(key)}
          </div>
          <div className="min-w-0 text-[0.82rem] leading-[1.4]">
            <ReleaseCatNumbersGeneralBlock
              value={nestedValue}
              depth={depth + 1}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const isStringArray = (value: ReleaseCatNumberGeneral) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const CAT_NUMBER_KEY_LABELS: Record<string, string> = {
  label: "Label",
  labels: "Labels",
  cat_number: "Cat. number",
  cat_numbers: "Cat. numbers",
};

const prettifyCatNumberKey = (key: string): string =>
  CAT_NUMBER_KEY_LABELS[key] ?? key;
