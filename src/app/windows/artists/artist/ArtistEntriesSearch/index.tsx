import { useEffect, useRef, useState, type FC } from "react";

import api from "../api";
import ArtistEntriesSearchResults from "../ArtistEntriesSearchResults";

import type { DbSource } from "@/db/db-source";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { EntrySearchResult } from "@/types/entries";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

/** Max number of search hits returned per request (page size). */
const ARTIST_ENTRIES_SEARCH_LIMIT = 10;

type ArtistEntriesSearchProps = {
  artistId: string;
  dbSource: DbSource;
  query: string;
  onQueryChange: (query: string) => void;
};

const ArtistEntriesSearch: FC<ArtistEntriesSearchProps> = ({
  artistId,
  dbSource,
  query,
  onQueryChange,
}) => {
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [debouncedQuery, isDebouncing] = useDebouncedValue(
    query,
    SEARCH_DEBOUNCE_MS,
  );

  /**
   * Monotonic id for artist-entry search requests. Incremented when clearing the query,
   * dispatching a new search, or unmounting, so responses from older requests are ignored.
   */
  const artistEntriesSearchRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      artistEntriesSearchRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    artistEntriesSearchRequestIdRef.current += 1;

    if (!debouncedQuery) {
      setEntries([]);
      setNextCursor(null);
      setIsSearching(false);

      return;
    }

    const dispatchedRequestId = artistEntriesSearchRequestIdRef.current;

    setIsSearching(true);

    api
      .searchArtistEntries(
        {
          artistId,
          query: debouncedQuery,
          limit: ARTIST_ENTRIES_SEARCH_LIMIT,
        },
        dbSource,
      )
      .then((data) => {
        if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
          setEntries(data.items);
          setNextCursor(data.nextCursor);
        }
      })
      .catch((error: unknown) => {
        console.error("Error searching entries", error);

        if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
          setEntries([]);
          setNextCursor(null);
        }
      })
      .finally(() => {
        if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
          setIsSearching(false);
        }
      });
  }, [artistId, debouncedQuery, dbSource]);

  const hasMoreToLoad = nextCursor !== null;

  const loadMore = () => {
    if (!hasMoreToLoad || isLoadingMore || !debouncedQuery) {
      return;
    }

    setIsLoadingMore(true);

    api
      .searchArtistEntries(
        {
          artistId,
          query: debouncedQuery,
          limit: ARTIST_ENTRIES_SEARCH_LIMIT,
          cursor: nextCursor,
        },
        dbSource,
      )
      .then((data) => {
        setEntries((prev) => [...prev, ...data.items]);
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
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter by name…"
        />
      </label>
      {debouncedQuery &&
        !isDebouncing &&
        !isSearching &&
        entries.length > 0 && (
          <p className="italic">
            {hasMoreToLoad
              ? `Showing first ${entries.length} results — more available`
              : "Showing all results"}
          </p>
        )}
      {debouncedQuery && (
        <ArtistEntriesSearchResults
          entries={entries}
          dbSource={dbSource}
          isSearching={isDebouncing || isSearching}
        />
      )}
      {hasMoreToLoad && (
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
