import type { ArtistUpsertAltNameRow } from "./formValues";

import type { ArtistAltNameInput } from "@/types/artists";
import type { ArtistType } from "@/types/db/database";
import { nullIfEmpty } from "@/utils/common";

type ToUpsertArtistInputArgs = {
  name: string;
  nameForSorting: string;
  type: ArtistType;
  partOfQueenFamily: boolean;
  altNames: ArtistUpsertAltNameRow[];
};

export const toUpsertArtistInput = ({
  name,
  nameForSorting,
  type,
  partOfQueenFamily,
  altNames,
}: ToUpsertArtistInputArgs) => ({
  artist: {
    name,
    nameForSorting: nullIfEmpty(nameForSorting),
    type,
    partOfQueenFamily,
  },
  altNames: altNames.map(toAltNameInput),
});

const toAltNameInput = (row: ArtistUpsertAltNameRow): ArtistAltNameInput => ({
  ...(row.nameId === undefined ? {} : { nameId: row.nameId }),
  name: row.name,
});
