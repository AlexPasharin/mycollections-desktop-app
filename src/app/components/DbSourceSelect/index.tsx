import { type FC } from "react";

import Select from "@/app/components/Select";
import type { DbSource } from "@/db/db-source";
import { DB_SOURCE_OPTIONS } from "@/db/db-source-options";

type DbSourceSelectProps = {
  id: string;
  value: DbSource;
  onChange: (source: DbSource) => void;
};

const DbSourceSelect: FC<DbSourceSelectProps> = ({ id, value, onChange }) => (
  <div className="flex items-center gap-2">
    <label className="text-sm text-[#555]" htmlFor={id}>
      Database
    </label>
    <Select
      id={id}
      value={value}
      onChange={(event) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- options are DbSource values only
        onChange(event.target.value as DbSource);
      }}
    >
      {DB_SOURCE_OPTIONS.map(({ value: optionValue, label }) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </Select>
  </div>
);

export default DbSourceSelect;
