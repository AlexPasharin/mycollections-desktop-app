import client from "../client/kysely";

// Musical entries left-joined with their artists, alt names and types.
// We use left joins because we also want to get entries that have no artists, types or alternative names
export const selectFromExtendedMusicalEntryRows = () =>
  client
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
