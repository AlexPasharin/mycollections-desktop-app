import type { CreateMusicalEntry, UpdateMusicalEntry } from "@/types/entries";
import type { FetchEntryTypes } from "@/types/entryTypes";
import type { GetEntryReleaseTagIds } from "@/types/releases";

export type UpsertEntryFormUpdateApi = {
  fetchEntryTypes: FetchEntryTypes;
  getEntryReleaseTagIds: GetEntryReleaseTagIds;
  updateMusicalEntry: UpdateMusicalEntry;
};

export type UpsertEntryFormCreateApi = {
  fetchEntryTypes: FetchEntryTypes;
  createMusicalEntry: CreateMusicalEntry;
};
