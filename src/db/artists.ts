import type { FunctionModule, QueryCreator } from "kysely";

import client from "./client/kysely";
import prismaClient from "./client/prisma";

import { Prisma } from "@/prisma/generated";
import type {
  DBArtist,
  FetchArtists,
  QueriedArtist,
  QueryArtist,
} from "@/types/artists";
import type { DB } from "@/types/db/database";

const BATCH_SIZE = 100;

const COMPARISON_OPERATORS = {
  LARGER_THAN: ">",
  SMALLER_THAN: "<",
  LARGER_OR_EQUAL_THAN: ">=",
  SMALLER_OR_EQUAL_THAN: "<=",
} as const;

export const fetchArtists: FetchArtists = async ({
  artistForCompare,
  batchSize = BATCH_SIZE,
  direction,
}) => {
  // fetch next batch in pagination
  const artists = await fetchArtistsBatch({
    artistForCompare,
    batchSize,
    comparisonOperator:
      direction === "next"
        ? COMPARISON_OPERATORS.LARGER_OR_EQUAL_THAN
        : COMPARISON_OPERATORS.SMALLER_OR_EQUAL_THAN,
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

type ComparisonOperator =
  (typeof COMPARISON_OPERATORS)[keyof typeof COMPARISON_OPERATORS];

const fetchArtistsBatch = ({
  artistForCompare,
  batchSize = BATCH_SIZE,
  comparisonOperator,
}: {
  artistForCompare: DBArtist | null;
  comparisonOperator: ComparisonOperator;
  batchSize?: number;
}): Promise<DBArtist[]> => {
  const sortingKey = (fn: FunctionModule<DB, "artists">) =>
    fn<string>("lower", [fn.coalesce("nameForSorting", "name")]);

  function createInnerQuery(db: QueryCreator<DB>) {
    let innerQuery = db
      .selectFrom("artists")
      .select(({ fn }) => ["artistId", "name", sortingKey(fn).as("sortKey")]);

    if (artistForCompare) {
      innerQuery = innerQuery.where(({ eb, fn }) =>
        eb(
          eb.refTuple(sortingKey(fn), "artistId"),
          comparisonOperator,
          eb.tuple(artistForCompare.sortKey, artistForCompare.artistId),
        ),
      );
    }

    const innerQueryOrderDirection =
      comparisonOperator === COMPARISON_OPERATORS.SMALLER_THAN ||
      comparisonOperator === COMPARISON_OPERATORS.SMALLER_OR_EQUAL_THAN
        ? "desc"
        : "asc";

    return innerQuery
      .orderBy("sortKey", innerQueryOrderDirection)
      .orderBy("artistId", innerQueryOrderDirection)
      .limit(batchSize);
  }

  // if we fetched previous results, we need to reverse result again, to get them in correct logical order in the end
  if (comparisonOperator === COMPARISON_OPERATORS.SMALLER_OR_EQUAL_THAN) {
    return client
      .with("artists", createInnerQuery)
      .selectFrom("artists")
      .selectAll()
      .orderBy("sortKey")
      .orderBy("artistId")
      .execute();
  }

  return createInnerQuery(client).execute();
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

  const artistsBatch = await fetchArtistsBatch({
    artistForCompare: artist,
    comparisonOperator:
      type === "next"
        ? COMPARISON_OPERATORS.LARGER_THAN
        : COMPARISON_OPERATORS.SMALLER_THAN,
    batchSize: 1,
  });

  return artistsBatch.at(0);
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

  const artistsDirectlyByName = await prismaClient.$queryRaw<
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

  const artistsByAltName = await prismaClient.$queryRaw<
    QueriedArtist[]
  >(Prisma.sql`
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

  const artistsDirectlyByName = await prismaClient.$queryRaw<
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

  const artistsByAltName = await prismaClient.$queryRaw<
    QueriedArtist[]
  >(Prisma.sql`
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
