import client from "./client";

import { Prisma } from "@/prisma/generated";
import type {
  DBArtist,
  FetchArtists,
  QueriedArtist,
  QueryArtist,
} from "@/types/artists";

const BATCH_SIZE = 100;

const LARGER_THAN = ">";
const SMALLER_THAN = "<";
const LARGER_OR_EQUAL_THAN = ">=";
const SMALLER_OR_EQUAL_THAN = "<=";

const ALLOWED_COMPARISON_OPERATORS = [
  LARGER_THAN,
  SMALLER_THAN,
  LARGER_OR_EQUAL_THAN,
  SMALLER_OR_EQUAL_THAN,
] as const;

export const fetchArtists: FetchArtists = async ({
  artistForCompare,
  batchSize = BATCH_SIZE,
  direction,
}) => {
  // fetch next batch in pagination
  const artists = await fetchArtistsBatch({
    artistForCompare,
    batchSize,
    direction:
      direction === "next" ? LARGER_OR_EQUAL_THAN : SMALLER_OR_EQUAL_THAN,
  });

  // fetch "previous" row in db, preceding all elements fetched above. This will be used as a cursor to fetch batch preceding this batch, if requested
  const prevArtist = await fetchNextOrPrevArtist({
    type: "prev",
    artist: artists.at(0),
  });

  // fetch "next row in db, succeeding all elements fetched above. This will be used as a cursor to fetch batch succeeding this batch, if requested
  const nextArtist = await fetchNextOrPrevArtist({
    type: "next",
    artist: artists.at(-1),
  });

  return {
    artists,
    prev: prevArtist,
    next: nextArtist,
  };
};

type Direction = (typeof ALLOWED_COMPARISON_OPERATORS)[number];

const sortingKey = Prisma.raw("LOWER(COALESCE(name_for_sorting, name))");

const fetchArtistsBatch = ({
  artistForCompare,
  direction,
  batchSize = BATCH_SIZE,
}: {
  artistForCompare: DBArtist | null;
  direction: Direction;
  batchSize?: number;
}): Promise<DBArtist[]> => {
  // we construct final query in parts, because some parts of it are optional (conditional logic)
  // also, we cannot express query in terms of Prisma client API (for instance because we cannot express LOWER(COALESCE(name_for_sorting, name)) using Prisma API)
  // that's why we resort to use $queryRaw

  const queryParts = [
    // SELECT and FROM query clauses
    // we need "sort_key" because it will be used in subsequent queries to fetch the next batch in pagination
    Prisma.sql`
      SELECT
        artist_id,
        name,
        ${sortingKey} AS sort_key
      FROM
        artists
    `,
  ];

  // if artistForCompare is given, we use as "cursor" and fetch db rows relative to this cursor element, with respect to ordering defined by (LOWER(COALESCE(name_for_sorting, name)), artist_id) pair
  if (artistForCompare) {
    const { artist_id, sort_key } = artistForCompare;

    if (!ALLOWED_COMPARISON_OPERATORS.includes(direction)) {
      throw Error(`Operator ${direction} is not allowed in this context!`); // SHOULD NOT HAPPEN and is in fact guaranteed by typescript. If happens though in runtime, skipping this check might lead to SQL injection attacks below, since we use Prisma.raw
    }

    // note that ::text casting is necessary, because in db artist_id's type is uuid, while artistForCompare.artist_id is a string
    queryParts.push(
      Prisma.sql`
          WHERE
            (${sortingKey}, artist_id::text) ${Prisma.raw(direction)} (${sort_key}, ${artist_id})
        `,
    );
  }

  // if we fetch previous rows, we need to reverse sorting order, to get a correct batch of records just preceding given "cursor" element
  const innerQueryOrderDirection =
    direction === SMALLER_THAN || direction === SMALLER_OR_EQUAL_THAN
      ? "DESC"
      : "ASC";

  queryParts.push(
    Prisma.sql`
      ${orderByClause(innerQueryOrderDirection)}
      LIMIT ${batchSize}
    `,
  );

  let query = Prisma.sql`${Prisma.join(queryParts, " ")}`;

  // if we fetched previous results, we need to reverse result again, to get them in correct logical order in the end
  if (direction === SMALLER_OR_EQUAL_THAN) {
    query = Prisma.sql`
    SELECT * FROM
      (${query})
    AS page
    ${orderByClause("ASC")}
  `;
  }

  return client.$queryRaw(query);

  function orderByClause(orderDirection: "ASC" | "DESC") {
    return Prisma.raw(`
      ORDER BY
        sort_key ${orderDirection},
        artist_id::text ${orderDirection}
    `);
  }
};

const fetchNextOrPrevArtist = async ({
  type,
  artist,
}: {
  type: "next" | "prev";
  artist?: DBArtist | undefined;
}): Promise<DBArtist | undefined> => {
  if (!artist) {
    return undefined;
  }

  return fetchArtistsBatch({
    artistForCompare: artist,
    direction: type === "next" ? LARGER_THAN : SMALLER_THAN,
    batchSize: 1,
  }).then((result) => result.at(0));
};

export const queryArtist: QueryArtist = async (query) => {
  if (!query) {
    return null;
  }

  const substringMatches = await getArtistsBySubstringQuery(query);
  const fuzzySearch = await getArtistsByFuzzySearch(query, substringMatches);

  return { substringMatches, fuzzySearch };
};

const getArtistsBySubstringQuery = async (
  query: string,
): Promise<QueriedArtist[]> => {
  const searchTerm = `%${query}%`;

  const artistsDirectlyByName = await client.$queryRaw<
    QueriedArtist[]
  >(Prisma.sql`
    SELECT
      artist_id AS id, name
    FROM
      artists
    WHERE
      name ILIKE ${searchTerm}
    ORDER BY
      similarity(lower(name), ${query}) DESC
    LIMIT
      10
  `);

  // in next query we want to remove artists we already found
  const artistIdsObtained = artistsDirectlyByName.map(({ id }) => id);

  const additionalWhereClause = artistIdsObtained.length
    ? Prisma.sql`AND artist_id::text NOT IN (${Prisma.join(artistIdsObtained)})`
    : Prisma.sql``;

  const artistsByAltName = await client.$queryRaw<QueriedArtist[]>(Prisma.sql`
    SELECT
      name_id AS id, name
    FROM
      alternative_artist_names
    WHERE
      name ILIKE ${searchTerm} ${additionalWhereClause}
    ORDER BY
      similarity(lower(name), ${query}) DESC
    LIMIT
      10
  `);

  return [...artistsDirectlyByName, ...artistsByAltName];
};

const getArtistsByFuzzySearch = async (
  query: string,
  exclude: QueriedArtist[],
): Promise<QueriedArtist[]> => {
  // in next query we want to remove artists we already found
  const artistIdsToExclude = exclude.map(({ id }) => id);

  const additionalWhereClause = artistIdsToExclude.length
    ? Prisma.sql`AND artist_id::text NOT IN (${Prisma.join(artistIdsToExclude)})`
    : Prisma.sql``;

  const artistsDirectlyByName = await client.$queryRaw<
    QueriedArtist[]
  >(Prisma.sql`
    SELECT
      artist_id AS id, name
    FROM
      artists
    WHERE
      similarity(lower(name), ${query}) > 0 ${additionalWhereClause}
    ORDER BY
      similarity(lower(name), ${query}) DESC
    LIMIT
      5
  `);

  const artistIdsObtained = artistsDirectlyByName.map(({ id }) => id);
  const altNameQueryArtistIdsToExclude = [
    ...artistIdsToExclude,
    ...artistIdsObtained,
  ];

  const altNameQueryAdditionalWhereClause =
    altNameQueryArtistIdsToExclude.length
      ? Prisma.sql`AND artist_id::text NOT IN (${Prisma.join(altNameQueryArtistIdsToExclude)})`
      : Prisma.sql``;

  const artistsByAltName = await client.$queryRaw<QueriedArtist[]>(Prisma.sql`
    SELECT
      name_id AS id, name
    FROM
      alternative_artist_names
    WHERE
      similarity(lower(name), ${query}) > 0 ${altNameQueryAdditionalWhereClause}
    ORDER BY
      similarity(lower(name), ${query}) DESC
    LIMIT
      5
  `);

  return [...artistsDirectlyByName, ...artistsByAltName];
};
