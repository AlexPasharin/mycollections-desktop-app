import type { UpsertEntryAltNameRow } from "./formValues";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { TagId } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";

type UpsertMusicalEntryRow = {
  mainName: string;
  originalReleaseDate: string | null;
  discogsUrl: string | null;
  comment: string | null;
  partOfQueenCollection: boolean;
  relationToQueen: string | null;
};

type UpsertMusicalEntryInputPayload = {
  entry: UpsertMusicalEntryRow;
  tagIds: string[];
  typeIds: string[];
  altNames: UpsertEntryAltNameRow[];
};

type ToUpsertMusicalEntryInputArgs = {
  mainName: string;
  originalReleaseDate: GeneralizedDateFormInputValue;
  discogsUrl: string;
  comment: string;
  selectedTags: Set<TagId>;
  selectedTypes: Set<string>;
  altNames: UpsertEntryAltNameRow[];
  partOfQueenCollection: boolean;
  relationToQueen: string;
};

export const toUpsertMusicalEntryInput = ({
  mainName,
  originalReleaseDate,
  discogsUrl,
  comment,
  selectedTags,
  selectedTypes,
  altNames,
  partOfQueenCollection,
  relationToQueen,
}: ToUpsertMusicalEntryInputArgs): UpsertMusicalEntryInputPayload => ({
  entry: {
    mainName,
    originalReleaseDate: generalizedDateToString(originalReleaseDate),
    discogsUrl: nullIfEmpty(discogsUrl),
    comment: nullIfEmpty(comment),
    partOfQueenCollection,
    relationToQueen: partOfQueenCollection
      ? nullIfEmpty(relationToQueen)
      : null,
  },
  tagIds: Array.from(selectedTags),
  typeIds: Array.from(selectedTypes),
  altNames,
});
