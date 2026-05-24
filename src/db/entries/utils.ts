import { dbClient } from "../client/kysely";

import type { DbSource } from "@/db/db-source";

// Musical entries left-joined with their artists, alt names and types.
// We use left joins because we also want to get entries that have no artists, types or alternative names
export const selectFromExtendedMusicalEntryRows = (dbSource?: DbSource) =>
  dbClient(dbSource)
    .selectFrom("musicalEntries")
    .leftJoin(
      "musicalEntriesArtists",
      "musicalEntries.entryId",
      "musicalEntriesArtists.entryId",
    )
    .leftJoin(
      "alternativeMusicalEntryNames",
      "musicalEntries.entryId",
      "alternativeMusicalEntryNames.entryId",
    )
    .leftJoin(
      "typesOfMusicalEntries",
      "musicalEntries.entryId",
      "typesOfMusicalEntries.entryId",
    )
    .leftJoin(
      "musicalEntryTypes",
      "typesOfMusicalEntries.typeId",
      "musicalEntryTypes.entryTypeId",
    )
    .leftJoin("artists", "musicalEntriesArtists.artistId", "artists.artistId");
