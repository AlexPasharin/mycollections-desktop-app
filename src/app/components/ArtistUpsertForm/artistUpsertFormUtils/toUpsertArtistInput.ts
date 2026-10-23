import type {
  ArtistUpsertAltNameRow,
  ValidatedArtistUpsertFormDraft,
  ValidArtistUpsertRelatedParentRow,
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
}: ValidatedArtistUpsertFormDraft) => ({
  artist: {
    name,
    nameForSorting: nullIfEmpty(nameForSorting),
    type,
    partOfQueenFamily,
  },
  altNames: altNames.map(toAltNameInput),
  relatedArtists: toRelatedArtistsFromForm(relatedParents),
});

const toAltNameInput = (row: ArtistUpsertAltNameRow): ArtistAltNameInput => ({
  ...(row.nameId === undefined ? {} : { nameId: row.nameId }),
  name: row.name,
});

const toRelatedArtistsFromForm = (
  rows: ValidArtistUpsertRelatedParentRow[],
): ArtistRelatedArtistInput[] =>
  rows.map(({ artistId, relation }) => ({
    relatedArtistId: artistId,
    relation,
  }));
