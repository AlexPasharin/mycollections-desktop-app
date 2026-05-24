import { dbClient } from "../client/kysely";

import type { GetArtistById } from "@/types/artists";

export { fetchArtists } from "./list";
export { queryArtist } from "./query";

export const getArtistById: GetArtistById = (artistId, dbSource) =>
  dbClient(dbSource)
    .selectFrom("artists")
    .select(["artistId", "name", "type", "partOfQueenFamily"])
    .where("artistId", "=", artistId)
    .executeTakeFirst();
