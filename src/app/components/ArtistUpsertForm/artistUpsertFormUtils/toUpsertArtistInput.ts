import type {
  ArtistUpsertAltNameRow,
  ArtistUpsertRelatedArtistRow,
} from "./formValues";

import type {
  ArtistAltNameInput,
  ArtistRelatedArtistInput,
} from "@/types/artists";
import type { RelatedItemRelation } from "@/types/common";
import type { ArtistType } from "@/types/db/database";
import { nullIfEmpty } from "@/utils/common";

type ToUpsertArtistInputArgs = {
  name: string;
  nameForSorting: string;
  type: ArtistType;
  partOfQueenFamily: boolean;
  altNames: ArtistUpsertAltNameRow[];
  relatedArtists: ArtistUpsertRelatedArtistRow[];
};

export const toUpsertArtistInput = ({
  name,
  nameForSorting,
  type,
  partOfQueenFamily,
  altNames,
  relatedArtists,
}: ToUpsertArtistInputArgs) => ({
  artist: {
    name,
    nameForSorting: nullIfEmpty(nameForSorting),
    type,
    partOfQueenFamily,
  },
  altNames: altNames.map(toAltNameInput),
  relatedArtists: toRelatedArtistsFromForm(relatedArtists),
});

const toAltNameInput = (row: ArtistUpsertAltNameRow): ArtistAltNameInput => ({
  ...(row.nameId === undefined ? {} : { nameId: row.nameId }),
  name: row.name,
});

const toRelatedArtistsFromForm = (
  rows: ArtistUpsertRelatedArtistRow[],
): ArtistRelatedArtistInput[] =>
  rows.map(({ artistId, relation }) => ({
    relatedArtistId: artistId,

    // The form validator guarantees the relation is valid before saving.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    relation: relation as RelatedItemRelation,
  }));
