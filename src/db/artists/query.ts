import { dbClient } from "../client/kysely";
import { orderBySimilarityToTextDesc, hasSimilarityToText } from "../utils";

import type { DbSource } from "@/db/db-source";
import type { QueriedArtist, QueryArtist } from "@/types/artists";

export const queryArtist: QueryArtist = async (query, dbSource) => {
  if (!query) {
    return null;
  }

  const [artistsDirectlyByName, artistsByAltName] = await Promise.all([
    getArtistsByMatchOnMainName(query, 10, 5, dbSource),
    getArtistsByMatchOnAltName(query, 10, 5, dbSource),
  ]);

  return {
    directMatches: [
      ...artistsDirectlyByName.directMatches,
      ...artistsByAltName.directMatches,
    ],
    fuzzyMatches: [
      ...artistsDirectlyByName.fuzzyMatches,
      ...artistsByAltName.fuzzyMatches,
    ],
  };
};

const getArtistsByMatchOnMainName = async (
  query: string,
  directMatchLimit: number,
  fuzzyMatchLimit: number,
  dbSource: DbSource,
) => {
  const artistsDirectlyByMainName = await getArtistsBySubstringMatchOnMainName(
    query,
    directMatchLimit,
    dbSource,
  );

  const artistsByFuzzyMatchOnMainName = await getArtistsByFuzzyMatchOnMainName(
    query,
    artistsDirectlyByMainName,
    fuzzyMatchLimit,
    dbSource,
  );

  return {
    directMatches: artistsDirectlyByMainName,
    fuzzyMatches: artistsByFuzzyMatchOnMainName,
  };
};

const getArtistsByMatchOnAltName = async (
  query: string,
  directMatchLimit: number,
  fuzzyMatchLimit: number,
  dbSource: DbSource,
) => {
  const artistsDirectlyByAltName = await getArtistsBySubstringMatchOnAltName(
    query,
    directMatchLimit,
    dbSource,
  );

  const artistsByFuzzyMatchOnAltName = await getArtistsByFuzzyMatchOnAltName(
    query,
    artistsDirectlyByAltName,
    fuzzyMatchLimit,
    dbSource,
  );

  return {
    directMatches: artistsDirectlyByAltName,
    fuzzyMatches: artistsByFuzzyMatchOnAltName,
  };
};

const getArtistsBySubstringMatchOnMainName = (
  query: string,
  limit: number,
  dbSource: DbSource,
) => {
  const searchTerm = `%${query}%`;
  const client = dbClient(dbSource);

  return orderBySimilarityToTextDesc(
    client
      .selectFrom("artists")
      .select(["artistId", "name"])
      .where("name", "ilike", searchTerm),
    "artists.name",
    query,
  )
    .limit(limit)
    .execute();
};

const getArtistsBySubstringMatchOnAltName = (
  query: string,
  limit: number,
  dbSource: DbSource,
) => {
  const searchTerm = `%${query}%`;
  const client = dbClient(dbSource);

  return orderBySimilarityToTextDesc(
    client
      .selectFrom("alternativeArtistNames")
      .select((eb) => ["artistId", "name", eb.ref("nameId").as("altNameId")])
      .where("name", "ilike", searchTerm),
    "alternative_artist_names.name",
    query,
  )
    .limit(limit)
    .execute();
};

const getArtistsByFuzzyMatchOnMainName = (
  query: string,
  excludeArtists: QueriedArtist[],
  limit: number,
  dbSource: DbSource,
) => {
  const client = dbClient(dbSource);

  let artistsQuery = client
    .selectFrom("artists")
    .select(["artistId", "name"])
    .where(hasSimilarityToText("artists.name", query));

  const excludeArtistIds = excludeArtists.map(({ artistId }) => artistId);

  if (excludeArtistIds.length > 0) {
    artistsQuery = artistsQuery.where("artistId", "not in", excludeArtistIds);
  }

  return orderBySimilarityToTextDesc(artistsQuery, "artists.name", query)
    .limit(limit)
    .execute();
};

const getArtistsByFuzzyMatchOnAltName = async (
  query: string,
  excludeArtists: (QueriedArtist & { altNameId: string })[],
  limit: number,
  dbSource: DbSource,
) => {
  const altArtistNameIdsToExclude = excludeArtists.map(
    ({ altNameId }) => altNameId,
  );

  const client = dbClient(dbSource);

  let altNameQuery = client
    .selectFrom("alternativeArtistNames")
    .select((eb) => ["artistId", "name", eb.ref("nameId").as("altNameId")])
    .where(hasSimilarityToText("alternative_artist_names.name", query));

  if (altArtistNameIdsToExclude.length > 0) {
    altNameQuery = altNameQuery.where(
      "nameId",
      "not in",
      altArtistNameIdsToExclude,
    );
  }

  const artistsByAltName = await orderBySimilarityToTextDesc(
    altNameQuery,
    "alternative_artist_names.name",
    query,
  )
    .limit(limit)
    .execute();

  return artistsByAltName;
};
