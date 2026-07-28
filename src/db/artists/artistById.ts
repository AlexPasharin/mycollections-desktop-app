import { sql, type Kysely } from "kysely";

import { fetchRelatedArtists } from "./relatedArtists";

import { dbClient } from "../client/kysely";

import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type {
  ArtistAltNameInfo,
  ArtistByIdResult,
  GetArtistById,
} from "@/types/artists";
import type { DB } from "@/types/db/database";

export const fetchArtistByIdResult = async (
  db: Kysely<DB>,
  artistId: string,
): Promise<ArtistByIdResult | undefined> => {
  const artistTableFields = [
    "artists.artistId",
    "artists.name",
    "artists.nameForSorting",
    "artists.type",
    "artists.partOfQueenFamily",
  ] as const;

  const artist = await db
    .selectFrom("artists")
    .leftJoin(
      "alternativeArtistNames",
      "artists.artistId",
      "alternativeArtistNames.artistId",
    )
    .where("artists.artistId", "=", artistId)
    .select([
      ...artistTableFields,

      sql<ArtistAltNameInfo[]>`coalesce(
        jsonb_agg(
          jsonb_build_object(
            'nameId', ${sql.ref("alternativeArtistNames.nameId")},
            'name', ${sql.ref("alternativeArtistNames.name")}
          )
          ORDER BY ${sql.ref("alternativeArtistNames.name")}
        ) FILTER (WHERE ${sql.ref("alternativeArtistNames.nameId")} IS NOT NULL),
        '[]'::jsonb
      )`.as("altNames"),
    ])
    .groupBy(artistTableFields)
    .executeTakeFirst();

  if (!artist) {
    return artist;
  }

  const [parentArtists, childArtists] = await Promise.all([
    fetchRelatedArtists(db, artistId, PARENT_RELATION),
    fetchRelatedArtists(db, artistId, CHILD_RELATION),
  ]);

  return {
    ...artist,
    parentArtists,
    childArtists,
  };
};

export const getArtistById: GetArtistById = (artistId, dbSource) =>
  fetchArtistByIdResult(dbClient(dbSource), artistId);
