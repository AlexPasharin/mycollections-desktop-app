import { type FC } from "react";

import ArtistEntriesList from "../ArtistEntriesList";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesSearchResultsProps = {
  entries: EntrySearchResult[];
  isSearching: boolean;
};

const ArtistEntriesSearchResults: FC<ArtistEntriesSearchResultsProps> = ({
  entries,
  isSearching,
}) => {
  if (isSearching) {
    return <p>Searching…</p>;
  }

  if (entries.length === 0) {
    return <p>No entries corresponding to the search term were found.</p>;
  }

  return <ArtistEntriesList entries={entries} />;
};

export default ArtistEntriesSearchResults;
