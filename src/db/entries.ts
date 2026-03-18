import client from "./client/kysely";

import type { SearchEntriesByArtist } from "@/types/entries";

export const searchEntriesByArtist: SearchEntriesByArtist = ({
  artistId,
  query,
}) =>
  client
    .selectFrom("musicalEntries")
    .innerJoin(
      "musicalEntriesArtists",
      "musicalEntries.entryId",
      "musicalEntriesArtists.entryId",
    )
    .select((qb) => [
      qb.ref("musicalEntries.entryId").as("entryId"),
      qb.ref("musicalEntries.mainName").as("mainName"),
    ])
    .where("musicalEntriesArtists.artistId", "=", artistId)
    .where("musicalEntries.mainName", "ilike", `%${query.trim()}%`)
    .orderBy("musicalEntries.mainName")
    .limit(10)
    .execute();
