import {
  validateArtistAltNames,
  validateNameForSorting,
  validateRelatedArtists,
} from "./validation";

import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { ArtistByIdResult } from "@/types/artists";
import type { RelatedItemRelation } from "@/types/common";
import { ArtistType } from "@/types/db/database";
import type { FormField, FormFieldError, RelatedItemRow } from "@/types/form";
import { withNewId } from "@/utils/id";
import { validatePassThrough, validateRequiredTrimmedText } from "@/validation";

export type ArtistUpsertAltNameRow = {
  id: string;
  nameId?: string;
  name: string;
};

export type ArtistUpsertRelatedArtistRow = RelatedItemRow<
  RelatedItemRelation | ""
> & {
  artistId: string;
};

export type ValidArtistUpsertRelatedParentRow = ArtistUpsertRelatedArtistRow & {
  relation: RelatedItemRelation;
};

export type ArtistUpsertRelatedParentsErrors = Record<string, FormFieldError[]>;

export type ArtistUpsertFormDraft = {
  name: FormField;
  nameForSorting: FormField;
  type: FormField<ArtistType>;
  partOfQueenFamily: FormField<boolean>;
  altNames: FormField<ArtistUpsertAltNameRow[]>;
  relatedParents: FormField<
    ArtistUpsertRelatedArtistRow[],
    ArtistUpsertRelatedParentsErrors,
    ValidArtistUpsertRelatedParentRow[]
  >;
};

export const defaultAltNameRow = (name = ""): ArtistUpsertAltNameRow =>
  withNewId({ name });

export const defaultRelatedParentRow = (): ArtistUpsertRelatedArtistRow =>
  withNewId({
    artistId: "",
    relation: "",
  });

export const initialArtistUpsertFormDraft = (
  artist?: ArtistByIdResult,
): ArtistUpsertFormDraft => ({
  name: {
    value: artist?.name ?? "",
    valid: true,
    validationFn: validateRequiredTrimmedText("Artist name is required"),
    errors: [],
    notifications: [],
  },
  nameForSorting: {
    value: artist?.nameForSorting ?? "",
    valid: true,
    validationFn: validateNameForSorting,
    errors: [],
    notifications: [],
  },
  type: {
    value: artist?.type ?? ArtistType.ARTIST,
    valid: true,
    validationFn: validatePassThrough,
    errors: [],
    notifications: [],
  },
  partOfQueenFamily: {
    value: artist?.partOfQueenFamily ?? false,
    valid: true,
    validationFn: validatePassThrough,
    errors: [],
    notifications: [],
  },
  altNames: {
    value:
      artist?.altNames.map(({ nameId, name }) => ({
        id: nameId,
        nameId,
        name,
      })) ?? [],
    valid: true,
    validationFn: validateArtistAltNames,
    errors: [],
    notifications: [],
  },
  relatedParents: {
    value: relatedArtistsToFormValue(
      artist?.parentArtists,
      artist?.childArtists,
    ),
    valid: true,
    validationFn: validateRelatedArtists,
    errors: {},
    notifications: [],
  },
});

const relatedArtistsToFormValue = (
  parentArtists: ArtistByIdResult["parentArtists"] | undefined,
  childArtists: ArtistByIdResult["childArtists"] | undefined,
): ValidArtistUpsertRelatedParentRow[] => [
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
