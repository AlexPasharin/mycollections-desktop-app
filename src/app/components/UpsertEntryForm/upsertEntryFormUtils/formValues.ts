import {
  validateAltNames,
  validateArtists,
  validateEntryDiscogsUrl,
  validateRelatedEntries,
} from "./validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { DbSource } from "@/db/db-source";
import type {
  InitialFormStateValue,
  FormStateType,
} from "@/hooks/useFormState";
import type { RelatedItemRelation } from "@/types/common";
import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";
import type { RelatedOrderedItemRow } from "@/types/form";
import type { TagId } from "@/types/tags";
import { withNewId } from "@/utils/id";
import {
  validateOptionalTrimmedText2,
  validatePassThrough2,
  validateReleaseDate2,
  validateRequiredTrimmedText2,
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
  mainName: string;
  originalReleaseDate: GeneralizedDateFormInputValue;
  discogsUrl: string;
  comment: string;
  selectedTags: Set<TagId>;
  selectedTypes: Set<string>;
  artists: UpsertEntryArtistRow[];
  altNames: UpsertEntryAltNameRow[];
  relatedEntries: UpsertEntryRelatedEntryRow[];
  partOfQueenCollection: boolean;
  relationToQueen: string;
};

export type ValidatedUpsertEntryFormDraft = Omit<
  UpsertEntryFormDraft,
  "relatedEntries"
> & {
  relatedEntries: ValidUpsertEntryRelatedEntryRow[];
};

export type UpsertEntryFormState = FormStateType<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft
>;

export type UpsertEntryFormPersistedState = {
  form: UpsertEntryFormState;
  checkedDbSources: ReadonlySet<DbSource>;
};

type InitialUpsertEntryFormDraftArgs = {
  entry?: UpsertEntryFormEntry | undefined;
  defaultArtistId?: string | undefined;
};

export const initialUpsertEntryFormDraft = ({
  entry,
  defaultArtistId,
}: InitialUpsertEntryFormDraftArgs): InitialFormStateValue<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft
> => {
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
      validationFn: (state) =>
        validateRequiredTrimmedText2(
          state.mainName.value,
          "Main name is required.",
        ),
    },
    originalReleaseDate: {
      value: {
        year: String(originalReleaseDate?.year ?? ""),
        month: String(originalReleaseDate?.month ?? ""),
        day: String(originalReleaseDate?.day ?? ""),
      },
      validationFn: (state) =>
        validateReleaseDate2(state.originalReleaseDate.value),
    },
    discogsUrl: {
      value: discogsUrl ?? "",
      validationFn: validateEntryDiscogsUrl,
    },
    comment: {
      value: comment ?? "",
      validationFn: (state) =>
        validateOptionalTrimmedText2(state.comment.value),
    },
    selectedTags: {
      value: new Set(tagIds),
      validationFn: (state) => validatePassThrough2(state.selectedTags.value),
    },
    selectedTypes: {
      value: new Set(typeIds),
      validationFn: (state) => validatePassThrough2(state.selectedTypes.value),
    },
    artists: {
      value: artistRows,
      validationFn: validateArtists,
    },
    altNames: {
      value: altNameRows,
      validationFn: validateAltNames,
    },
    relatedEntries: {
      value: relatedEntries,
      validationFn: validateRelatedEntries,
    },
    partOfQueenCollection: {
      value: partOfQueenCollection ?? false,
      validationFn: (state) =>
        validatePassThrough2(state.partOfQueenCollection.value),
    },
    relationToQueen: {
      value: relationToQueen ?? "",
      validationFn: (state) =>
        validateOptionalTrimmedText2(state.relationToQueen.value),
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
