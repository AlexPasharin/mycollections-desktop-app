import { validateArtistAltNames, validateNameForSorting } from "./validation";

import type { ArtistByIdResult } from "@/types/artists";
import { ArtistType } from "@/types/db/database";
import type { FormField } from "@/types/form";
import { withNewId } from "@/utils/id";
import { validatePassThrough, validateRequiredTrimmedText } from "@/validation";

export type ArtistUpsertAltNameRow = {
  id: string;
  nameId?: string;
  name: string;
};

export type ArtistUpsertFormDraft = {
  name: FormField;
  nameForSorting: FormField;
  type: FormField<ArtistType>;
  partOfQueenFamily: FormField<boolean>;
  altNames: FormField<ArtistUpsertAltNameRow[]>;
};

export const defaultAltNameRow = (name = ""): ArtistUpsertAltNameRow =>
  withNewId({ name });

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
    validationFn: validateArtistAltNames(artist?.name ?? ""),
    errors: [],
    notifications: [],
  },
});
