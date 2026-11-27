import { sql, type Kysely } from "kysely";

import { dbClient } from "../client/kysely";

import { ENTRIES_WITHOUT_TYPE_GROUP_LABEL } from "@/constants";
import type { DB } from "@/types/db/database";
import type {
  ArtistEntriesTypeGroup,
  FetchArtistEntriesGroupedByType,
  FetchArtistEntriesOfType,
} from "@/types/entries";
import { parseStringAsGeneralizedDate } from "@/utils/date";

// Returns the entry types represented among the artist's entries (with entries counts), ordered by name,
// followed by the "Others" group (entries without a type) when there are such entries.
export const fetchArtistEntriesGroupedByType: FetchArtistEntriesGroupedByType =
  async (artistId, dbSource) => {
    const db = dbClient(dbSource);

    const [typedRows, untypedRow] = await Promise.all([
      db
        .selectFrom("musicalEntryTypes")
        .innerJoin(
          "typesOfMusicalEntries",
          "musicalEntryTypes.entryTypeId",
          "typesOfMusicalEntries.typeId",
        )
        .where(
          "typesOfMusicalEntries.entryId",
          "in",
          selectArtistEntryIds(db, artistId),
        )
        .select([
          "musicalEntryTypes.entryTypeId as typeId",
          "musicalEntryTypes.name as typeName",
          sql<string>`count(*)`.as("entriesCount"),
        ])
        .groupBy(["musicalEntryTypes.entryTypeId", "musicalEntryTypes.name"])
        .orderBy("typeName", "asc")
        .execute(),

      selectArtistUntypedEntries(db, artistId)
        .select(sql<string>`count(*)`.as("entriesCount"))
        .executeTakeFirst(),
    ]);

    const typedGroups: ArtistEntriesTypeGroup[] = typedRows.map(
      ({ typeId, typeName, entriesCount }) => ({
        typeId,
        typeName,
        entriesCount: Number(entriesCount),
      }),
    );

    const untypedEntriesCount = untypedRow
      ? Number(untypedRow.entriesCount)
      : 0;

    if (untypedEntriesCount > 0) {
      typedGroups.push({
        typeId: null,
        typeName: ENTRIES_WITHOUT_TYPE_GROUP_LABEL,
        entriesCount: untypedEntriesCount,
      });
    }

    return typedGroups;
  };

// Returns entries of one group (type, or "no type" when typeId is null) ordered by release date (undated last).
// Ordered by release date, with an incomplete date ("1991", "1991-12") placed after all the more precise dates inside its period
// (e.g. "1991-12" goes after "1991-12-31"): generalised_date_to_date(.., true) moves an incomplete date to the end of its period,
// and ties with a precise date at that end are broken by the text length (longer, i.e. more precise, first).
export const fetchArtistEntriesOfType: FetchArtistEntriesOfType = async (
  { artistId, typeId, offset, limit },
  dbSource,
) => {
  const db = dbClient(dbSource);

  let query =
    typeId === null
      ? selectArtistUntypedEntries(db, artistId)
      : db
          .selectFrom("musicalEntries")
          .where(
            "musicalEntries.entryId",
            "in",
            selectArtistEntryIds(db, artistId),
          )
          .where(
            "musicalEntries.entryId",
            "in",
            db
              .selectFrom("typesOfMusicalEntries")
              .select("typesOfMusicalEntries.entryId")
              .where("typesOfMusicalEntries.typeId", "=", typeId),
          );

  if (offset != null) {
    query = query.offset(offset);
  }

  if (limit != null) {
    query = query.limit(limit);
  }

  const rows = await query
    .select([
      "musicalEntries.entryId as entryId",
      "musicalEntries.mainName as mainName",
      "musicalEntries.originalReleaseDate as originalReleaseDate",
    ])
    .orderBy(
      sql`generalised_date_to_date(${sql.ref("musicalEntries.originalReleaseDate")}, true)`,
      (ob) => ob.asc().nullsLast(),
    )
    .orderBy(
      sql`length(${sql.ref("musicalEntries.originalReleaseDate")})`,
      "desc",
    )
    .orderBy("musicalEntries.mainName")
    .orderBy("musicalEntries.entryId")
    .execute();

  return rows.map(({ entryId, mainName, originalReleaseDate }) => ({
    entryId,
    mainName,
    originalReleaseDate: parseStringAsGeneralizedDate(originalReleaseDate),
  }));
};

// May return the same entry id several times (unique constraint is on entry, artist AND entry's artist name).
// It is only safe to use in "IN (subquery)" conditions, which ignore duplicates; joining to it would require "distinct".
const selectArtistEntryIds = (db: Kysely<DB>, artistId: string) =>
  db
    .selectFrom("musicalEntriesArtists")
    .select("musicalEntriesArtists.entryId")
    .where("musicalEntriesArtists.artistId", "=", artistId);

// Entries of the artist that have no type at all
const selectArtistUntypedEntries = (db: Kysely<DB>, artistId: string) =>
  db
    .selectFrom("musicalEntries")
    .where("musicalEntries.entryId", "in", selectArtistEntryIds(db, artistId))
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom("typesOfMusicalEntries")
            .select("typesOfMusicalEntries.entryId")
            .whereRef(
              "typesOfMusicalEntries.entryId",
              "=",
              "musicalEntries.entryId",
            ),
        ),
      ),
    );
