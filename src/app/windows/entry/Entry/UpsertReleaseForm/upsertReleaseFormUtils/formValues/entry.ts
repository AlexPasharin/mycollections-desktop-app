import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";

export type UpsertReleaseFormEntry = Omit<
  EntryByIdResult,
  "originalReleaseDate"
> & {
  originalReleaseDate: GeneralizedDate | null;
};
