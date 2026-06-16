import type { FC } from "react";

import styles from "./ReleaseNameField.module.css";

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
  <div className={styles.field}>
    <label className={styles.heading} htmlFor="add-release-name">
      Name
    </label>
    <select
      id="add-release-name"
      className={styles.select}
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
