import type { UpsertReleaseFormEntry } from "./entry";

import type { EntryAltNameInfo } from "@/types/entries";
import type { ReleaseByIdResult } from "@/types/releases";

export type UpsertReleaseFormNameInput = Omit<EntryAltNameInfo, "nameId"> & {
  nameId: string | null;
};

export const resolveNameInput = (
  entry: UpsertReleaseFormEntry,
  release: ReleaseByIdResult | undefined,
): UpsertReleaseFormNameInput => {
  const alternativeName = release?.alternativeName;

  const matchedAltName = alternativeName
    ? entry.altNames.find(
        (altName) => altName.nameId === alternativeName.nameId,
      )
    : null;

  return matchedAltName
    ? { nameId: matchedAltName.nameId, name: matchedAltName.name }
    : defaultNameInput(entry.mainName);
};

export const defaultNameInput = (name: string): UpsertReleaseFormNameInput => ({
  nameId: null,
  name,
});
