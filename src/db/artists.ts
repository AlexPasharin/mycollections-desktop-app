import client from "./client";

import { Prisma } from "../../prisma/generated";

type DBArtist = {
  artist_id: string;
  sort_key: string;
  name: string;
};

export const getArtists = async () => {
  const artists: { name: string; id: string }[] = [];
  const BATCH_SIZE = 100;

  let cursor: DBArtist | undefined;

  do {
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
            (LOWER(COALESCE(name_for_sorting, name)), artist_id::text) > (${cursor.sort_key}, ${cursor.artist_id})
        `,
      );
    }

    queryParts.push(
      Prisma.sql`
        ORDER BY
          sort_key,
          artist_id::text
        LIMIT
          ${BATCH_SIZE}
      `,
    );

    const query = Prisma.sql`${Prisma.join(queryParts, " ")}`;
    const result = await client.$queryRaw<DBArtist[]>(query);

    cursor = result.at(-1);

    artists.push(
      ...result.map(({ artist_id, name }) => ({
        id: artist_id,
        name,
      })),
    );
  } while (cursor);

  return artists;
};
