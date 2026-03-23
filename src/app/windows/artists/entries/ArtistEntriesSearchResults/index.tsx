import { type FC } from "react";

import styles from "./ArtistEntriesSearchResults.module.css";

import ArtistEntriesList from "../ArtistEntriesList";
import { ARTIST_ENTRIES_SEARCH_LIMIT } from "../artistEntriesSearchConstants";

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

  return (
    <>
      {entries.length === ARTIST_ENTRIES_SEARCH_LIMIT && (
        <p className={styles.topResultsNote}>
          Showing {ARTIST_ENTRIES_SEARCH_LIMIT} top results
        </p>
      )}
      <ArtistEntriesList entries={entries} />
    </>
  );
};

export default ArtistEntriesSearchResults;
