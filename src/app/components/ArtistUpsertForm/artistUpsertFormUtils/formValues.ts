import {
  validateArtistAltNames,
  validateNameForSorting,
  validateRelatedArtists,
} from "./validation";

import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { InitialFormStateValue } from "@/hooks/useFormState";
import type { ArtistByIdResult } from "@/types/artists";
import type { RelatedItemRelation } from "@/types/common";
import { ArtistType } from "@/types/db/database";
import type { FormFieldError, RelatedItemRow } from "@/types/form";
import { withNewId } from "@/utils/id";
import {
  validatePassThrough2,
  validateRequiredTrimmedText2,
} from "@/validation";

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
  name: string;
  nameForSorting: string;
  type: ArtistType;
  partOfQueenFamily: boolean;
  altNames: ArtistUpsertAltNameRow[];
  relatedParents: ArtistUpsertRelatedArtistRow[];
};

export type ValidatedArtistUpsertFormDraft = Omit<
  ArtistUpsertFormDraft,
  "relatedParents"
> & {
  relatedParents: ValidArtistUpsertRelatedParentRow[];
};

export const defaultAltNameRow = (name = ""): ArtistUpsertAltNameRow =>
  withNewId({ name });

export const defaultRelatedParentRow = (): ArtistUpsertRelatedArtistRow =>
  withNewId({
    artistId: "",
    relation: "",
  });

export const initialArtistUpsertFormDraft2 = (
  artist?: ArtistByIdResult,
): InitialFormStateValue<
  ArtistUpsertFormDraft,
  ValidatedArtistUpsertFormDraft
> => ({
  name: {
    value: artist?.name ?? "",
    validationFn: (state) =>
      validateRequiredTrimmedText2("Artist name is required")(state.name.value),
  },
  nameForSorting: {
    value: artist?.nameForSorting ?? "",
    validationFn: validateNameForSorting,
  },
  type: {
    value: artist?.type ?? ArtistType.ARTIST,
    validationFn: (state) => validatePassThrough2(state.type.value),
  },
  partOfQueenFamily: {
    value: artist?.partOfQueenFamily ?? false,
    validationFn: (state) =>
      validatePassThrough2(state.partOfQueenFamily.value),
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
