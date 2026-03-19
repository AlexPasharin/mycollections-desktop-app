import { type FunctionModule, type QueryCreator } from "kysely";

import client from "../client/kysely";

import type { DBArtist, FetchArtists } from "@/types/artists";
import type { DB } from "@/types/db/database";

const BATCH_SIZE = 100;

export const fetchArtists: FetchArtists = async ({
  artistForCompare,
  batchSize = BATCH_SIZE,
  direction,
}) => {
  const artists = await fetchArtistsBatch({
    artistForCompare,
    batchSize,
    comparisonOperator:
      direction === "next"
        ? COMPARISON_OPERATORS.LARGER_OR_EQUAL_THAN
        : COMPARISON_OPERATORS.SMALLER_OR_EQUAL_THAN,
  });

  const prevArtist = await fetchNextOrPrevArtist({
    type: "prev",
    artist: artists.at(0),
  });

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

const COMPARISON_OPERATORS = {
  LARGER_THAN: ">",
  SMALLER_THAN: "<",
  LARGER_OR_EQUAL_THAN: ">=",
  SMALLER_OR_EQUAL_THAN: "<=",
} as const;

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
