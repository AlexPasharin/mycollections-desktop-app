import {
  validateArtistAltNames,
  validateNameForSorting,
  validateRelatedArtists,
} from "./validation";

import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { ArtistByIdResult } from "@/types/artists";
import type { RelatedItemRelation } from "@/types/common";
import { ArtistType } from "@/types/db/database";
import type {
  InitialFormStateValue,
  FormFeedbackMessages,
  RelatedItemRow,
} from "@/types/form";
import { withNewId } from "@/utils/id";
import { validatePassThrough, validateRequiredTrimmedText } from "@/validation";

export type UpsertArtistAltNameRow = {
  id: string;
  nameId?: string;
  name: string;
};

export type UpsertArtistRelatedArtistRow = RelatedItemRow<
  RelatedItemRelation | ""
> & {
  artistId: string;
};

export type ValidUpsertArtistRelatedParentRow = UpsertArtistRelatedArtistRow & {
  relation: RelatedItemRelation;
};

export type UpsertArtistRelatedParentsErrors = Record<
  string,
  FormFeedbackMessages
>;

export type UpsertArtistFormDraft = {
  name: string;
  nameForSorting: string;
  type: ArtistType;
  partOfQueenFamily: boolean;
  altNames: UpsertArtistAltNameRow[];
  relatedParents: UpsertArtistRelatedArtistRow[];
};

export type ValidatedUpsertArtistFormDraft = Omit<
  UpsertArtistFormDraft,
  "relatedParents"
> & {
  relatedParents: ValidUpsertArtistRelatedParentRow[];
};

export const defaultAltNameRow = (name = ""): UpsertArtistAltNameRow =>
  withNewId({ name });

export const defaultRelatedParentRow = (): UpsertArtistRelatedArtistRow =>
  withNewId({
    artistId: "",
    relation: "",
  });

export const initialUpsertArtistFormDraft = (
  artist?: ArtistByIdResult,
): InitialFormStateValue<
  UpsertArtistFormDraft,
  ValidatedUpsertArtistFormDraft
> => ({
  name: {
    value: artist?.name ?? "",
    validationFn: (state) =>
      validateRequiredTrimmedText(state.name.value, "Artist name is required"),
  },
  nameForSorting: {
    value: artist?.nameForSorting ?? "",
    validationFn: validateNameForSorting,
  },
  type: {
    value: artist?.type ?? ArtistType.ARTIST,
    validationFn: (state) => validatePassThrough(state.type.value),
  },
  partOfQueenFamily: {
    value: artist?.partOfQueenFamily ?? false,
    validationFn: (state) => validatePassThrough(state.partOfQueenFamily.value),
  },
  altNames: {
    value:
      artist?.altNames.map(({ nameId, name }) => ({
        id: nameId,
        nameId,
        name,
      })) ?? [],
    validationFn: validateArtistAltNames,
  },
  relatedParents: {
    value: relatedArtistsToFormValue(
      artist?.parentArtists,
      artist?.childArtists,
    ),
    validationFn: (state) => validateRelatedArtists(state.relatedParents.value),
  },
});

const relatedArtistsToFormValue = (
  parentArtists: ArtistByIdResult["parentArtists"] | undefined,
  childArtists: ArtistByIdResult["childArtists"] | undefined,
): ValidUpsertArtistRelatedParentRow[] => [
  ...(parentArtists ?? []).map(({ artistId }) =>
    withNewId({
      artistId,
      relation: PARENT_RELATION as RelatedItemRelation,
    }),
  ),
  ...(childArtists ?? []).map(({ artistId }) =>
    withNewId({
      artistId,
      relation: CHILD_RELATION as RelatedItemRelation,
    }),
  ),
];
