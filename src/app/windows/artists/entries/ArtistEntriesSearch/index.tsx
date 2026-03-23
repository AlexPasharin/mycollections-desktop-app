import { type FC, useEffect, useState } from "react";

import styles from "./ArtistEntriesSearch.module.css";

import api from "../api";
import ArtistEntriesList from "../ArtistEntriesList";

import type { EntrySearchResult } from "@/types/entries";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

/** Max number of search hits returned and shown in the list. */
const ARTIST_ENTRIES_SEARCH_LIMIT = 10;

type ArtistEntriesSearchProps = {
  artistId: string;
  query: string;
};

const ArtistEntriesSearch: FC<ArtistEntriesSearchProps> = ({
  artistId,
  query,
}) => {
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setEntries([]);
      setIsSearching(false);

      return;
    }

    /** True for the whole debounce window + in-flight request until it settles. */
    setIsSearching(true);

    let cancelled = false;

    const timeoutId = setTimeout(() => {
      void api
        .searchArtistEntries({
          artistId,
          query: trimmedQuery,
          limit: ARTIST_ENTRIES_SEARCH_LIMIT,
        })
        .then((data) => {
          if (!cancelled) {
            setEntries(data);
          }
        })
        .catch((error: unknown) => {
          console.error("Error searching entries", error);

          if (!cancelled) {
            setEntries([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearching(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [artistId, query]);

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

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

export default ArtistEntriesSearch;
