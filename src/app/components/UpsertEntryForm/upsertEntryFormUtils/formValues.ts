import {
  initialUpsertEntryFormFieldErrors,
  type UpsertEntryAltNamesErrors,
  type UpsertEntryArtistsErrors,
} from "./errorMessages";
import {
  validateAltNames,
  validateArtists,
  validateEntryDiscogsUrl,
  validateRelatedEntries,
} from "./validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { DbSource } from "@/db/db-source";
import type { RelatedItemRelation } from "@/types/common";
import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";
import type {
  FormField,
  FormFieldError,
  RelatedOrderedItemRow,
} from "@/types/form";
import type { TagId } from "@/types/tags";
import { withNewId } from "@/utils/id";
import {
  validateOptionalTrimmedText,
  validateReleaseDate,
  validateRequiredTrimmedText,
  validatePassThrough,
} from "@/validation";

export type UpsertEntryFormEntry = Omit<
  EntryByIdResult,
  "originalReleaseDate"
> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type UpsertEntryAltNameRow = {
  id: string;
  nameId?: string;
  name: string;
};

export const defaultAltNameRow = (name = ""): UpsertEntryAltNameRow =>
  withNewId({ name });

export type UpsertEntryArtistRow = {
  id: string;
  artistId: string;
  entryArtistAltNameId: string;
  isEntriesMainArtist: boolean;
};

export const defaultArtistRow = (): UpsertEntryArtistRow =>
  withNewId({
    artistId: "",
    entryArtistAltNameId: "",
    isEntriesMainArtist: false,
  });

export type UpsertEntryRelatedEntryRow = RelatedOrderedItemRow & {
  entryId: string;
};

export type ValidUpsertEntryRelatedEntryRow = UpsertEntryRelatedEntryRow & {
  relation: RelatedItemRelation;
};

export const defaultRelatedEntryRow = (
  childEntryOrderNumber: number | null,
): UpsertEntryRelatedEntryRow =>
  withNewId({
    entryId: "",
    relation: "child",
    orderNumber:
      childEntryOrderNumber === null ? "" : String(childEntryOrderNumber),
  });

export type UpsertEntryFormDraft = {
  mainName: FormField;
  originalReleaseDate: FormField<GeneralizedDateFormInputValue>;
  discogsUrl: FormField;
  comment: FormField<string>;
  selectedTags: FormField<Set<TagId>>;
  selectedTypes: FormField<Set<string>>;
  artists: FormField<UpsertEntryArtistRow[], UpsertEntryArtistsErrors>;
  altNames: FormField<UpsertEntryAltNameRow[], UpsertEntryAltNamesErrors>;
  relatedEntries: FormField<
    UpsertEntryRelatedEntryRow[],
    FormFieldError[],
    ValidUpsertEntryRelatedEntryRow[]
  >;
  partOfQueenCollection: FormField<boolean>;
  relationToQueen: FormField<string>;
};

export type UpsertEntryFormPersistedState = {
  form: UpsertEntryFormDraft;
  checkedDbSources: ReadonlySet<DbSource>;
};

type InitialUpsertEntryFormDraftArgs = {
  entry?: UpsertEntryFormEntry | undefined;
  defaultArtistId?: string | undefined;
};

export const initialUpsertEntryFormDraft = ({
  entry,
  defaultArtistId,
}: InitialUpsertEntryFormDraftArgs): UpsertEntryFormDraft => {
  const {
    mainName,
    originalReleaseDate,
    discogsUrl,
    comment,
    partOfQueenCollection,
    relationToQueen,
    tags,
    types,
    artists,
    altNames,
    parentEntries,
    childEntries,
  } = entry ?? {};

  const tagIds = tags?.map((tag) => tag.tagId) ?? [];
  const typeIds = types?.map((type) => type.entryTypeId) ?? [];

  const artistRows = artistsToFormValue(artists, defaultArtistId);

  const altNameRows =
    altNames?.map(({ nameId, name }) => ({
      id: nameId,
      nameId,
      name,
    })) ?? [];

  const relatedEntries = relatedEntriesToFormValue(parentEntries, childEntries);

  return {
    mainName: {
      value: mainName ?? "",
      valid: true,
      validationFn: validateRequiredTrimmedText("Main name is required."),
      errors: initialUpsertEntryFormFieldErrors.mainName,
      notifications: [],
    },
    originalReleaseDate: {
      value: {
        year: String(originalReleaseDate?.year ?? ""),
        month: String(originalReleaseDate?.month ?? ""),
        day: String(originalReleaseDate?.day ?? ""),
      },
      valid: true,
      validationFn: validateReleaseDate(null),
      errors: initialUpsertEntryFormFieldErrors.originalReleaseDate,
      notifications: [],
    },
    discogsUrl: {
      value: discogsUrl ?? "",
      valid: true,
      validationFn: validateEntryDiscogsUrl,
      errors: initialUpsertEntryFormFieldErrors.discogsUrl,
      notifications: [],
    },
    comment: {
      value: comment ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialUpsertEntryFormFieldErrors.comment,
      notifications: [],
    },
    selectedTags: {
      value: new Set(tagIds),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialUpsertEntryFormFieldErrors.selectedTags,
      notifications: [],
    },
    selectedTypes: {
      value: new Set(typeIds),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialUpsertEntryFormFieldErrors.selectedTypes,
      notifications: [],
    },
    artists: {
      value: artistRows,
      valid: true,
      validationFn: validateArtists,
      errors: initialUpsertEntryFormFieldErrors.artists,
      notifications: [],
    },
    altNames: {
      value: altNameRows,
      valid: true,
      validationFn: validateAltNames(mainName ?? ""),
      errors: initialUpsertEntryFormFieldErrors.altNames,
      notifications: [],
    },
    relatedEntries: {
      value: relatedEntries,
      valid: true,
      validationFn: validateRelatedEntries,
      errors: initialUpsertEntryFormFieldErrors.relatedEntries,
      notifications: [],
    },
    partOfQueenCollection: {
      value: partOfQueenCollection ?? false,
      valid: true,
      validationFn: validatePassThrough,
      errors: initialUpsertEntryFormFieldErrors.partOfQueenCollection,
      notifications: [],
    },
    relationToQueen: {
      value: relationToQueen ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialUpsertEntryFormFieldErrors.relationToQueen,
      notifications: [],
    },
  };
};

const artistsToFormValue = (
  artists: EntryByIdResult["artists"] | undefined,
  defaultArtistId: string | undefined,
): UpsertEntryArtistRow[] => {
  if (artists !== undefined) {
    return artists.map(
      ({ artistId, entryArtistAltNameId, isEntriesMainArtist }) =>
        withNewId({
          artistId,
          entryArtistAltNameId: entryArtistAltNameId ?? "",
          isEntriesMainArtist: isEntriesMainArtist ?? false,
        }),
    );
  }

  if (defaultArtistId) {
    return [
      withNewId({
        artistId: defaultArtistId,
        entryArtistAltNameId: "",
        isEntriesMainArtist: true,
      }),
    ];
  }

  return [];
};

const relatedEntriesToFormValue = (
  parentEntries: EntryByIdResult["parentEntries"] | undefined,
  childEntries: EntryByIdResult["childEntries"] | undefined,
): ValidUpsertEntryRelatedEntryRow[] => [
  ...(parentEntries ?? []).map(({ entryId, childEntryOrderNumber }) =>
    withNewId({
      entryId: entryId,
      relation: PARENT_RELATION as RelatedItemRelation,
      orderNumber: String(childEntryOrderNumber),
    }),
  ),
  ...(childEntries ?? []).map(({ entryId, childEntryOrderNumber }) =>
    withNewId({
      entryId: entryId,
      relation: CHILD_RELATION as RelatedItemRelation,
      orderNumber: String(childEntryOrderNumber),
    }),
  ),
];
