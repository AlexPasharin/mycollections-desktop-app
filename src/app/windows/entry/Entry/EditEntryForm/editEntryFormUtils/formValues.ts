import {
  initialEditEntryFormFieldErrors,
  type EditEntryAltNamesErrors,
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

export type EditEntryFormEntry = Omit<
  EntryByIdResult,
  "originalReleaseDate"
> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type EditEntryAltNameRow = {
  id: string;
  nameId?: string;
  name: string;
};

export const defaultAltNameRow = (name = ""): EditEntryAltNameRow =>
  withNewId({ name });

export type EditEntryFormDraft = {
  mainName: FormField;
  originalReleaseDate: FormField<GeneralizedDateFormInputValue>;
  discogsUrl: FormField;
  comment: FormField<string>;
  selectedTags: FormField<Set<TagId>>;
  selectedTypes: FormField<Set<string>>;
  altNames: FormField<EditEntryAltNameRow[], EditEntryAltNamesErrors>;
  partOfQueenCollection: FormField<boolean>;
  relationToQueen: FormField<string>;
};

export type EditEntryFormPersistedState = {
  form: EditEntryFormDraft;
  checkedDbSources: ReadonlySet<DbSource>;
};

export const initialEditEntryFormDraftValue = (
  entry: EditEntryFormEntry,
): EditEntryFormDraft => {
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

  return {
    mainName: {
      value: mainName,
      valid: true,
      validationFn: validateRequiredTrimmedText("Main name is required."),
      errors: initialEditEntryFormFieldErrors.mainName,
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
      errors: initialEditEntryFormFieldErrors.originalReleaseDate,
      notifications: [],
    },
    discogsUrl: {
      value: discogsUrl ?? "https://www.discogs.com/master/<id>-...",
      valid: true,
      validationFn: validateEntryDiscogsUrl,
      errors: initialEditEntryFormFieldErrors.discogsUrl,
      notifications: [],
    },
    comment: {
      value: comment ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialEditEntryFormFieldErrors.comment,
      notifications: [],
    },
    selectedTags: {
      value: new Set(tags.map((tag) => tag.tagId)),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialEditEntryFormFieldErrors.selectedTags,
      notifications: [],
    },
    selectedTypes: {
      value: new Set(types.map((type) => type.entryTypeId)),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialEditEntryFormFieldErrors.selectedTypes,
      notifications: [],
    },
    altNames: {
      value: altNames.map(({ nameId, name }) => ({
        id: nameId,
        nameId,
        name,
      })),
      valid: true,
      validationFn: validateAltNames(mainName),
      errors: initialEditEntryFormFieldErrors.altNames,
      notifications: [],
    },
    partOfQueenCollection: {
      value: partOfQueenCollection,
      valid: true,
      validationFn: validatePassThrough,
      errors: initialEditEntryFormFieldErrors.partOfQueenCollection,
      notifications: [],
    },
    relationToQueen: {
      value: relationToQueen ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialEditEntryFormFieldErrors.relationToQueen,
      notifications: [],
    },
  };
};
