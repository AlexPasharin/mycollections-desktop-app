import { type FC } from "react";

import EntriesListItem from "./EntriesListItem";

import type { EntrySearchResult } from "@/types/entries";

type EntriesListProps = {
  entries: EntrySearchResult[];
  onOpenEntry: (entryId: string) => void;
  showArtistNames: boolean;
};

const EntriesList: FC<EntriesListProps> = ({
  entries,
  onOpenEntry,
  showArtistNames,
}) => (
  <ul className="mt-3 list-none pl-0">
    {entries.map((entry) => (
      <EntriesListItem
        key={entry.entryId}
        entry={entry}
        onOpenEntry={onOpenEntry}
        showArtistNames={showArtistNames}
      />
    ))}
  </ul>
);

export default EntriesList;
