import type { UpsertEntryAltNameRow, UpsertEntryFormEntry } from "./formValues";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { UpdateMusicalEntryInput } from "@/types/entries";
import type { TagId } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";

type ToUpdateMusicalEntryInputArgs = {
  entry: UpsertEntryFormEntry;
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

export const toUpdateMusicalEntryInput = ({
  entry,
  mainName,
  originalReleaseDate,
  discogsUrl,
  comment,
  selectedTags,
  selectedTypes,
  altNames,
  partOfQueenCollection,
  relationToQueen,
}: ToUpdateMusicalEntryInputArgs): UpdateMusicalEntryInput => ({
  entryId: entry.entryId,
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
