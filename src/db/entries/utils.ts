import type { Kysely } from "kysely";

import type { DB } from "@/types/db/database";

// Musical entries left-joined with their artists, alt names and types.
// We use left joins because we also want to get entries that have no artists, types or alternative names
export const selectFromExtendedMusicalEntryRows = (db: Kysely<DB>) =>
  db
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

// Entry ids related to the artist either as an entry artist or via a release special artist.
// Safe only in "IN (subquery)" conditions (duplicates possible).
export const selectArtistRelatedEntryIds = (db: Kysely<DB>, artistId: string) =>
  selectArtistEntryIds(db, artistId).union(
    selectArtistSpecialArtistEntryIds(db, artistId),
  );

// Entry ids where the artist is listed on the entry itself.
// May return the same entry id several times (unique constraint is on entry, artist AND entry's artist name).
// It is only safe to use in "IN (subquery)" conditions, which ignore duplicates; joining to it would require "distinct".
const selectArtistEntryIds = (db: Kysely<DB>, artistId: string) =>
  db
    .selectFrom("musicalEntriesArtists")
    .select("musicalEntriesArtists.entryId")
    .where("musicalEntriesArtists.artistId", "=", artistId);

// Entry ids where the artist appears as a special artist on at least one release of the entry.
const selectArtistSpecialArtistEntryIds = (db: Kysely<DB>, artistId: string) =>
  db
    .selectFrom("musicalReleaseSpecialArtists")
    .innerJoin(
      "musicalReleases",
      "musicalReleaseSpecialArtists.releaseId",
      "musicalReleases.releaseId",
    )
    .select("musicalReleases.entryId")
    .where("musicalReleaseSpecialArtists.artistId", "=", artistId);
