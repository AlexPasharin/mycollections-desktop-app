import { type FC } from "react";

import type { DbSource } from "@/db/db-source";
import { DB_SOURCE_OPTIONS } from "@/db/db-source-options";

type DbSourcesCheckboxesProps = {
  heading: string;
  headingId: string;
  idPrefix: string;
  activeDbSource: DbSource;
  checkedSources: ReadonlySet<DbSource>;
  onToggle: (source: DbSource) => void;
};

const DbSourcesCheckboxes: FC<DbSourcesCheckboxesProps> = ({
  heading,
  headingId,
  idPrefix,
  activeDbSource,
  checkedSources,
  onToggle,
}) => (
  <section
    className="mt-4 border-t border-black/12 pt-4"
    aria-labelledby={headingId}
  >
    <h3
      id={headingId}
      className="mb-[0.6rem] text-[0.95rem] leading-[1.35] font-semibold text-gray-800"
    >
      {heading}
    </h3>
    <ul className="m-0 flex list-none flex-col gap-[0.45rem] p-0">
      {DB_SOURCE_OPTIONS.map(({ value, label }) => {
        const isActive = value === activeDbSource;
        const checkboxId = `${idPrefix}-${value}`;

        return (
          <li key={value} className="flex items-start gap-2">
            <input
              id={checkboxId}
              type="checkbox"
              checked={checkedSources.has(value)}
              disabled={isActive}
              onChange={() => onToggle(value)}
            />
            <label
              htmlFor={checkboxId}
              className={`m-0 text-[0.95rem] leading-[1.35] font-normal ${isActive ? "text-gray-500" : "text-gray-700"}`}
            >
              {label}
              {isActive && " (current)"}
            </label>
          </li>
        );
      })}
    </ul>
  </section>
);

export default DbSourcesCheckboxes;
