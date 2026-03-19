import client from "../client/kysely";

import type { SearchArtistEntries } from "@/types/entries";

export const searchArtistEntries: SearchArtistEntries = ({
  artistId,
  query,
  limit = 10,
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
    .limit(limit)
    .execute();
