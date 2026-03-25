import client from "../client/kysely";
import { orderBySimilarityToTextDesc, hasSimilarityToText } from "../utils";

import type { QueriedArtist, QueryArtist } from "@/types/artists";

export const queryArtist: QueryArtist = async (query) => {
  if (!query) {
    return null;
  }

  const [artistsDirectlyByName, artistsByAltName] = await Promise.all([
    getArtistsByMatchOnMainName(query, 10, 5),
    getArtistsByMatchOnAltName(query, 10, 5),
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
) => {
  const artistsDirectlyByMainName = await getArtistsBySubstringMatchOnMainName(
    query,
    directMatchLimit,
  );

  const artistsByFuzzyMatchOnMainName = await getArtistsByFuzzyMatchOnMainName(
    query,
    artistsDirectlyByMainName,
    fuzzyMatchLimit,
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
) => {
  const artistsDirectlyByAltName = await getArtistsBySubstringMatchOnAltName(
    query,
    directMatchLimit,
  );

  const artistsByFuzzyMatchOnAltName = await getArtistsByFuzzyMatchOnAltName(
    query,
    artistsDirectlyByAltName,
    fuzzyMatchLimit,
  );

  return {
    directMatches: artistsDirectlyByAltName,
    fuzzyMatches: artistsByFuzzyMatchOnAltName,
  };
};

const getArtistsBySubstringMatchOnMainName = (query: string, limit: number) => {
  const searchTerm = `%${query}%`;

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

const getArtistsBySubstringMatchOnAltName = (query: string, limit: number) => {
  const searchTerm = `%${query}%`;

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
) => {
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
) => {
  const altArtistNameIdsToExclude = excludeArtists.map(
    ({ altNameId }) => altNameId,
  );

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
