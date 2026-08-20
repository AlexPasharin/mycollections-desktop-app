import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";

export type ReleaseFormEntry = Omit<EntryByIdResult, "originalReleaseDate"> & {
  originalReleaseDate: GeneralizedDate | null;
};
