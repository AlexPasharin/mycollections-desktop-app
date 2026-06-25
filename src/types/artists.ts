import type { Updateable } from "kysely";

import type { DbSource } from "@/db/db-source";
import type { Artist, ArtistType } from "@/types/db/database";

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
  dbSource: DbSource,
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

export type QueryArtist = (
  query: string,
  dbSource: DbSource,
) => Promise<ArtistQueryResult>;

export type ArtistAltNameInfo = {
  nameId: string;
  name: string;
};

export type ArtistByIdResult = {
  artistId: string;
  name: string;
  type: ArtistType;
  partOfQueenFamily: boolean;
  altNames: ArtistAltNameInfo[];
};

export type GetArtistById = (
  artistId: string,
  dbSource: DbSource,
) => Promise<ArtistByIdResult | undefined>;

export type ArtistAltNameInput = {
  nameId?: string;
  name: string;
};

export type UpdateArtistInput = {
  artistId: string;
  artist: Omit<Updateable<Artist>, "artistId">;
  altNames: ArtistAltNameInput[];
};

export type UpdateArtist = (
  input: UpdateArtistInput,
  dbSource: DbSource,
) => Promise<{ artist: ArtistByIdResult; notifications: string[] }>;
