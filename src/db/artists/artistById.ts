import type { Kysely } from "kysely";

import { dbClient } from "../client/kysely";

import type { ArtistByIdResult, GetArtistById } from "@/types/artists";
import type { DB } from "@/types/db/database";

export const fetchArtistByIdResult = async (
  db: Kysely<DB>,
  artistId: string,
): Promise<ArtistByIdResult | undefined> => {
  const artist = await db
    .selectFrom("artists")
    .select(["artistId", "name", "nameForSorting", "type", "partOfQueenFamily"])
    .where("artistId", "=", artistId)
    .executeTakeFirst();

  if (!artist) {
    return undefined;
  }

  const altNames = await db
    .selectFrom("alternativeArtistNames")
    .select(["nameId", "name"])
    .where("artistId", "=", artistId)
    .orderBy("name", "asc")
    .execute();

  return { ...artist, altNames };
};

export const getArtistById: GetArtistById = (artistId, dbSource) =>
  fetchArtistByIdResult(dbClient(dbSource), artistId);
