import client from "./client";

import { Prisma } from "@/prisma/generated";
import type {
  DBArtist,
  DBArtistCursor,
  FetchArtists,
  FetchArtistsParams,
} from "@/types/artists";

const BATCH_SIZE = 100;

const fetchArtistsBatch = ({
  cursor,
  batchSize = BATCH_SIZE,
}: FetchArtistsParams): Promise<DBArtist[]> => {
  const queryParts = [
    Prisma.sql`
        SELECT
          artist_id,
          name,
          LOWER(COALESCE(name_for_sorting, name)) AS sort_key
        FROM
          artists
      `,
  ];

  if (cursor) {
    queryParts.push(
      Prisma.sql`
          WHERE
            (LOWER(COALESCE(name_for_sorting, name)), artist_id::text) >= (${cursor.sort_key}, ${cursor.artist_id})
        `,
    );
  }

  queryParts.push(
    Prisma.sql`
        ORDER BY
          sort_key,
          artist_id::text
        LIMIT
          ${batchSize}
      `,
  );

  const query = Prisma.sql`${Prisma.join(queryParts, " ")}`;

  return client.$queryRaw(query);
};

const fetchNextArtist = async (
  artist?: DBArtist,
): Promise<DBArtistCursor | null> => {
  if (!artist) {
    return null;
  }

  const { artist_id, sort_key } = artist;

  return client.$queryRaw<DBArtistCursor[]>`
    SELECT
      artist_id,
      LOWER(COALESCE(name_for_sorting, name)) AS sort_key
    FROM
      artists
    WHERE
      (LOWER(COALESCE(name_for_sorting, name)), artist_id::text) > (${sort_key}, ${artist_id})
    ORDER BY
      sort_key,
      artist_id::text
    LIMIT
      1
  `.then((result) => result.at(0) ?? null);
};

export const fetchArtists: FetchArtists = async ({
  cursor,
  batchSize = BATCH_SIZE,
}) => {
  const artists = await fetchArtistsBatch({ cursor, batchSize });

  const lastArtist = artists.at(-1);
  const nextArtist = await fetchNextArtist(lastArtist);

  return { artists, next: nextArtist };
};
