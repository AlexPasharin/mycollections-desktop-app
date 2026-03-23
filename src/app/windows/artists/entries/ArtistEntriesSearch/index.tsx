import { type FC, useEffect, useState } from "react";

import styles from "./ArtistEntriesSearch.module.css";

import api from "../api";
import ArtistEntriesList from "../ArtistEntriesList";

import type { EntrySearchResult } from "@/types/entries";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

/** Max number of search hits returned and shown in the list. */
const ARTIST_ENTRIES_SEARCH_LIMIT = 22;

type ArtistEntriesSearchProps = {
  artistId: string;
  query: string;
};

const ArtistEntriesSearch: FC<ArtistEntriesSearchProps> = ({
  artistId,
  query,
}) => {
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setEntries([]);
      setHasMore(false);
      setNextCursor(null);
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
            setEntries(data.items);
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
          }
        })
        .catch((error: unknown) => {
          console.error("Error searching entries", error);

          if (!cancelled) {
            setEntries([]);
            setHasMore(false);
            setNextCursor(null);
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

  const loadMore = () => {
    if (!hasMore || !nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    void api
      .searchArtistEntries({
        artistId,
        query: trimmedQuery,
        limit: ARTIST_ENTRIES_SEARCH_LIMIT,
        cursor: nextCursor,
      })
      .then((data) => {
        setEntries((prev) => [...prev, ...data.items]);
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      })
      .catch((error: unknown) => {
        console.error("Error loading more search results", error);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  };

  return (
    <>
      {hasMore && entries.length === ARTIST_ENTRIES_SEARCH_LIMIT && (
        <p className={styles.topResultsNote}>
          Showing first {ARTIST_ENTRIES_SEARCH_LIMIT} results — more available
        </p>
      )}
      <ArtistEntriesList entries={entries} />
      {hasMore && (
        <p>
          <button type="button" disabled={isLoadingMore} onClick={loadMore}>
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </p>
      )}
    </>
  );
};

export default ArtistEntriesSearch;
