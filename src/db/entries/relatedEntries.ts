import { sql, type Kysely } from "kysely";

import type { DB } from "@/types/db/database";
import type {
  EntryArtistInfo,
  MusicalEntryRelatedEntryInput,
  RelatedEntryItem,
} from "@/types/entries";

export const fetchRelatedEntries = (
  db: Kysely<DB>,
  entryId: string,
  relation: "parent" | "child",
): Promise<RelatedEntryItem[]> => {
  const relatedEntryJoinColumn =
    relation === "parent"
      ? "parentMusicalEntries.parentEntryId"
      : "parentMusicalEntries.childEntryId";
  const currentEntryFilterColumn =
    relation === "parent"
      ? "parentMusicalEntries.childEntryId"
      : "parentMusicalEntries.parentEntryId";

  return db
    .selectFrom("parentMusicalEntries")
    .innerJoin(
      "musicalEntries",
      relatedEntryJoinColumn,
      "musicalEntries.entryId",
    )
    .leftJoin(
      "musicalEntriesArtists",
      "musicalEntries.entryId",
      "musicalEntriesArtists.entryId",
    )
    .leftJoin("artists", "musicalEntriesArtists.artistId", "artists.artistId")
    .leftJoin(
      "alternativeArtistNames",
      "musicalEntriesArtists.entryArtistNameId",
      "alternativeArtistNames.nameId",
    )
    .where(currentEntryFilterColumn, "=", entryId)
    .select([
      "musicalEntries.entryId",
      "musicalEntries.mainName",
      sql<EntryArtistInfo[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'artistId', ${sql.ref("musicalEntriesArtists.artistId")},
          'isEntriesMainArtist', ${sql.ref("musicalEntriesArtists.isEntriesMainArtist")},
          'artistName', coalesce(${sql.ref("alternativeArtistNames.name")}, ${sql.ref("artists.name")})
        )) FILTER (WHERE ${sql.ref("musicalEntriesArtists.id")} IS NOT NULL),
        '[]'::jsonb
      )`.as("artists"),
    ])
    .groupBy([
      "musicalEntries.entryId",
      "musicalEntries.mainName",
      "parentMusicalEntries.childEntryOrderNumber",
    ])
    .orderBy("parentMusicalEntries.childEntryOrderNumber", "asc")
    .orderBy("musicalEntries.mainName", "asc")
    .orderBy("musicalEntries.entryId", "asc")
    .execute();
};

export const insertEntryRelatedEntries = async (
  trx: Kysely<DB>,
  entryId: string,
  relatedEntries: MusicalEntryRelatedEntryInput[],
) => {
  const rows = relatedEntries.map(({ relatedEntryId, relation }) =>
    relation === "parent"
      ? { parentEntryId: relatedEntryId, childEntryId: entryId }
      : { parentEntryId: entryId, childEntryId: relatedEntryId },
  );

  if (rows.length === 0) {
    return;
  }

  await trx.insertInto("parentMusicalEntries").values(rows).execute();
};
