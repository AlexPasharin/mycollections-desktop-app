import client from "../client/kysely";

import type { GetArtistById } from "@/types/artists";

export { fetchArtists } from "./list";
export { queryArtist } from "./query";

export const getArtistById: GetArtistById = (artistId) =>
  client
    .selectFrom("artists")
    .select(["artistId", "name"])
    .where("artistId", "=", artistId)
    .executeTakeFirst();
