import type {
  UpsertArtistAltNameRow,
  ValidatedUpsertArtistFormDraft,
  ValidUpsertArtistRelatedParentRow,
} from "./formValues";

import type {
  ArtistAltNameInput,
  ArtistRelatedArtistInput,
} from "@/types/artists";
import { nullIfEmpty } from "@/utils/common";

export const toUpsertArtistInput = ({
  name,
  nameForSorting,
  type,
  partOfQueenFamily,
  altNames,
  relatedParents,
}: ValidatedUpsertArtistFormDraft) => ({
  artist: {
    name,
    nameForSorting: nullIfEmpty(nameForSorting),
    type,
    partOfQueenFamily,
  },
  altNames: altNames.map(toAltNameInput),
  relatedArtists: toRelatedArtistsFromForm(relatedParents),
});

const toAltNameInput = (row: UpsertArtistAltNameRow): ArtistAltNameInput => ({
  ...(row.nameId === undefined ? {} : { nameId: row.nameId }),
  name: row.name,
});

const toRelatedArtistsFromForm = (
  rows: ValidUpsertArtistRelatedParentRow[],
): ArtistRelatedArtistInput[] =>
  rows.map(({ artistId, relation }) => ({
    relatedArtistId: artistId,
    relation,
  }));
