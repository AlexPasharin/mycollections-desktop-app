import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const ArtistType = {
    BAND: "BAND",
    ARTIST: "ARTIST",
    ORCHESTRA: "ORCHESTRA",
    DUET: "DUET",
    SHOW_CAST: "SHOW_CAST",
    COMPOSER: "COMPOSER",
    SONG_WRITER: "SONG_WRITER",
    SONG_WRITER_TEAM: "SONG_WRITER_TEAM",
    DIRECTOR: "DIRECTOR",
    SERIES_CREATOR: "SERIES_CREATOR",
    COLLABORATION: "COLLABORATION",
    CHOREOGRAPHER: "CHOREOGRAPHER",
    CONDUCTOR: "CONDUCTOR",
    VARIOUS_ARTISTS: "VARIOUS_ARTISTS"
} as const;
export type ArtistType = (typeof ArtistType)[keyof typeof ArtistType];
export type AlternativeArtistName = {
    nameId: Generated<string>;
    name: string;
    artistId: string;
};
export type Artist = {
    artistId: Generated<string>;
    name: string;
    nameForSorting: string | null;
    partOfQueenFamily: Generated<boolean>;
    type: ArtistType;
};
export type ParentArtist = {
    parentArtistId: string;
    childArtistId: string;
};
export type DB = {
    alternativeArtistNames: AlternativeArtistName;
    artists: Artist;
    parentArtists: ParentArtist;
};
