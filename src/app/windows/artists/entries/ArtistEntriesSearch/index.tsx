import { type FC, useEffect, useRef, useState } from "react";

import api from "../api";
import {
  ARTIST_ENTRIES_SEARCH_LIMIT,
  SEARCH_DEBOUNCE_MS,
} from "../artistEntriesSearchConstants";
import ArtistEntriesSearchResults from "../ArtistEntriesSearchResults";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesSearchProps = {
  artistId: string;
};

const ArtistEntriesSearch: FC<ArtistEntriesSearchProps> = ({ artistId }) => {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const artistEntriesSearchTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  /**
   * Monotonic id for artist-entry search requests. Incremented when clearing the query,
   * dispatching a new search, or unmounting, so responses from older requests are ignored.
   */
  const artistEntriesSearchRequestIdRef = useRef(0);

  // Unmount-only cleanup
  useEffect(() => {
    return () => {
      // - Clear any pending debounce timer so it cannot fire after unmount and call setState.
      if (artistEntriesSearchTimeoutRef.current !== null) {
        clearTimeout(artistEntriesSearchTimeoutRef.current);
      }

      // - Bump the request id so in-flight handlers for older searches skip setState.
      artistEntriesSearchRequestIdRef.current += 1;
    };
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (artistEntriesSearchTimeoutRef.current) {
      // cancel any pending debounce timer
      clearTimeout(artistEntriesSearchTimeoutRef.current);
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      artistEntriesSearchRequestIdRef.current += 1;
      setEntries([]);
      setHasMore(false);
      setNextCursor(null);
      setIsSearching(false);

      return;
    }

    setIsSearching(true);

    artistEntriesSearchTimeoutRef.current = setTimeout(() => {
      const dispatchedRequestId = ++artistEntriesSearchRequestIdRef.current;

      api
        .searchArtistEntries({
          artistId,
          query: trimmedValue,
          limit: ARTIST_ENTRIES_SEARCH_LIMIT,
        })
        .then((data) => {
          if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
            setEntries(data.items);
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
          }
        })
        .catch((error: unknown) => {
          console.error("Error searching entries", error);

          if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
            setEntries([]);
            setHasMore(false);
            setNextCursor(null);
          }
        })
        .finally(() => {
          if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
            setIsSearching(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);
  };

  const trimmedQuery = query.trim();



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
      <label>
        <p>Search for artist entries:</p>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Filter by name…"
        />
      </label>
      {hasMore && entries.length === ARTIST_ENTRIES_SEARCH_LIMIT && (
        <p className={styles.topResultsNote}>
          Showing first {ARTIST_ENTRIES_SEARCH_LIMIT} results — more available
        </p>
      )}
      {trimmedQuery && (
        <ArtistEntriesSearchResults
          entries={entries}
          isSearching={isSearching}
        />
      )}
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
