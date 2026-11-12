import { type FC } from "react";

import EntriesList from "./EntriesList";

import type { EntrySearchResult } from "@/types/entries";

type EntriesSearchResultsProps = {
  entries: EntrySearchResult[];
  onOpenEntry: (entryId: string) => void;
  showArtistNames: boolean;
  isSearching: boolean;
};

const EntriesSearchResults: FC<EntriesSearchResultsProps> = ({
  entries,
  onOpenEntry,
  showArtistNames,
  isSearching,
}) => {
  if (isSearching) {
    return <p>Searching…</p>;
  }

  if (entries.length === 0) {
    return <p>No entries corresponding to the search term were found.</p>;
  }

  return (
    <EntriesList
      entries={entries}
      onOpenEntry={onOpenEntry}
      showArtistNames={showArtistNames}
    />
  );
};

export default EntriesSearchResults;
