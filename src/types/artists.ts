import type { ArtistType } from "@/types/db/database";

export type ListArtist = {
  artistId: string;
  sortKey: string;
  name: string;
};

export type FetchArtistsParams = {
  artistForCompare: ListArtist | null;
  batchSize?: number;
  direction: "next" | "prev";
};

export type FetchArtistsResponse = {
  artists: ListArtist[];
  prev: ListArtist | undefined;
  next: ListArtist | undefined;
};

export type FetchArtists = (
  params: FetchArtistsParams,
) => Promise<FetchArtistsResponse>;

export type QueriedArtist = {
  artistId: string;
  name: string;
  altNameId?: string;
};

export type ArtistQueryResult = {
  directMatches: QueriedArtist[];
  fuzzyMatches: QueriedArtist[];
} | null;

export type QueryArtist = (query: string) => Promise<ArtistQueryResult>;

export type ArtistByIdResult = {
  artistId: string;
  name: string;
  type: ArtistType;
  partOfQueenFamily: boolean;
};

export type GetArtistById = (
  artistId: string,
) => Promise<ArtistByIdResult | undefined>;
