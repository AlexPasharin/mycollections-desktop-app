import type { UpsertEntryAltNameRow } from "./formValues";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { CreateMusicalEntryInput } from "@/types/entries";
import type { TagId } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";

type ToCreateMusicalEntryInputArgs = {
  artistId: string;
  entryId?: string;
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

export const toCreateMusicalEntryInput = ({
  artistId,
  entryId,
  mainName,
  originalReleaseDate,
  discogsUrl,
  comment,
  selectedTags,
  selectedTypes,
  altNames,
  partOfQueenCollection,
  relationToQueen,
}: ToCreateMusicalEntryInputArgs): CreateMusicalEntryInput => ({
  artistId,
  entry: {
    ...(entryId === undefined ? {} : { entryId }),
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
  altNames: altNames
    .map((altName) => altName.name.trim())
    .filter((name) => name.length > 0),
});
