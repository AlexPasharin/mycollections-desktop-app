import type {
  UpsertEntryAltNameRow,
  UpsertEntryArtistRow,
  UpsertEntryRelatedEntryRow,
} from "./formValues";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type {
  MusicalEntryArtistInput,
  MusicalEntryRelatedEntryInput,
} from "@/types/entries";
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
  artists: MusicalEntryArtistInput[];
  tagIds: string[];
  typeIds: string[];
  altNames: UpsertEntryAltNameRow[];
  relatedEntries: MusicalEntryRelatedEntryInput[];
};

type ToUpsertMusicalEntryInputArgs = {
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

export const toUpsertMusicalEntryInput = ({
  mainName,
  originalReleaseDate,
  discogsUrl,
  comment,
  selectedTags,
  selectedTypes,
  artists,
  altNames,
  relatedEntries,
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
  artists: toArtistsFromForm(artists),
  tagIds: Array.from(selectedTags),
  typeIds: Array.from(selectedTypes),
  altNames,
  relatedEntries: toRelatedEntriesFromForm(relatedEntries),
});

export const toArtistsFromForm = (
  rows: UpsertEntryArtistRow[],
): MusicalEntryArtistInput[] =>
  rows.map(({ artistId, entryArtistAltNameId, isEntriesMainArtist }) => ({
    artistId,
    entryArtistAltNameId: nullIfEmpty(entryArtistAltNameId),
    isEntriesMainArtist,
  }));

export const toRelatedEntriesFromForm = (
  rows: UpsertEntryRelatedEntryRow[],
): MusicalEntryRelatedEntryInput[] =>
  rows.map(({ entryId, relation, orderNumber }) => ({
    relatedEntryId: entryId,
    relation,
    childEntryOrderNumber: parseInt(orderNumber, 10), // orderNumber is guaranteed to be a positive integer by the form validator
  }));
