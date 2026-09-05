import type { FC } from "react";

import {
  defaultNameInput,
  type ReleaseFormNameInput,
} from "../releaseFormUtils/formValues";

import type { EntryAltNameInfo } from "@/types/entries";

type ReleaseNameFieldProps = {
  entryMainName: string;
  entryAltNames: EntryAltNameInfo[];
  value: ReleaseFormNameInput;
  onChange: (value: ReleaseFormNameInput) => void;
};

const ReleaseNameField: FC<ReleaseNameFieldProps> = ({
  entryMainName,
  entryAltNames,
  value,
  onChange,
}) => (
  <div className="mt-[0.85rem] mb-[0.65rem] flex flex-col gap-[0.35rem]">
    <label
      className="m-0 mb-3 text-[1em] leading-[1.35] font-semibold"
      htmlFor="add-release-name"
    >
      Name
    </label>
    <select
      id="add-release-name"
      className="box-border w-full max-w-[24rem] px-2 py-[0.35rem] text-[1em]"
      value={value.nameId ?? ""}
      onChange={(e) => {
        const { value: selected } = e.target;

        if (selected === "") {
          onChange(defaultNameInput(entryMainName));

          return;
        }

        const picked = entryAltNames.find((alt) => alt.nameId === selected);

        if (picked) {
          onChange({ nameId: picked.nameId, name: picked.name });
        }
      }}
    >
      <option value="">{entryMainName}</option>
      {entryAltNames.map((altName) => (
        <option key={altName.nameId} value={altName.nameId}>
          {altName.name}
        </option>
      ))}
    </select>
  </div>
);

export default ReleaseNameField;
