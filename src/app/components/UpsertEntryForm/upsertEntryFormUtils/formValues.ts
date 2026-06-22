import {
  initialUpsertEntryFormFieldErrors,
  type UpsertEntryAltNamesErrors,
} from "./errorMessages";
import { validateAltNames, validateEntryDiscogsUrl } from "./validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { DbSource } from "@/db/db-source";
import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";
import type { FormField } from "@/types/form";
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

export type UpsertEntryFormDraft = {
  mainName: FormField;
  originalReleaseDate: FormField<GeneralizedDateFormInputValue>;
  discogsUrl: FormField;
  comment: FormField<string>;
  selectedTags: FormField<Set<TagId>>;
  selectedTypes: FormField<Set<string>>;
  altNames: FormField<UpsertEntryAltNameRow[], UpsertEntryAltNamesErrors>;
  partOfQueenCollection: FormField<boolean>;
  relationToQueen: FormField<string>;
};

export type UpsertEntryFormPersistedState = {
  form: UpsertEntryFormDraft;
  checkedDbSources: ReadonlySet<DbSource>;
};

export const initialUpdateEntryFormDraft = (
  entry: UpsertEntryFormEntry,
): UpsertEntryFormDraft => {
  const {
    mainName,
    originalReleaseDate,
    discogsUrl,
    comment,
    partOfQueenCollection,
    relationToQueen,
    tags,
    types,
    altNames,
  } = entry;

  return buildUpsertEntryFormDraft({
    mainName,
    originalReleaseDate,
    discogsUrl,
    comment,
    partOfQueenCollection,
    relationToQueen,
    tagIds: tags.map((tag) => tag.tagId),
    typeIds: types.map((type) => type.entryTypeId),
    altNames: altNames.map(({ nameId, name }) => ({
      id: nameId,
      nameId,
      name,
    })),
  });
};

export const initialCreateEntryFormDraft = (): UpsertEntryFormDraft =>
  buildUpsertEntryFormDraft({
    mainName: "",
    originalReleaseDate: null,
    discogsUrl: "https://www.discogs.com/master/<id>-...",
    comment: "",
    partOfQueenCollection: false,
    relationToQueen: null,
    tagIds: [],
    typeIds: [],
    altNames: [],
  });

type BuildUpsertEntryFormDraftArgs = {
  mainName: string;
  originalReleaseDate: GeneralizedDate | null;
  discogsUrl: string | null;
  comment: string | null;
  partOfQueenCollection: boolean;
  relationToQueen: string | null;
  tagIds: TagId[];
  typeIds: string[];
  altNames: UpsertEntryAltNameRow[];
};

const buildUpsertEntryFormDraft = ({
  mainName,
  originalReleaseDate,
  discogsUrl,
  comment,
  partOfQueenCollection,
  relationToQueen,
  tagIds,
  typeIds,
  altNames,
}: BuildUpsertEntryFormDraftArgs): UpsertEntryFormDraft => ({
  mainName: {
    value: mainName,
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
    value: discogsUrl ?? "https://www.discogs.com/master/<id>-...",
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
  altNames: {
    value: altNames,
    valid: true,
    validationFn: validateAltNames(mainName),
    errors: initialUpsertEntryFormFieldErrors.altNames,
    notifications: [],
  },
  partOfQueenCollection: {
    value: partOfQueenCollection,
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
});
