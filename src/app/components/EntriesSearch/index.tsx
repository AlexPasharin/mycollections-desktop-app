import { useEffect, useRef, useState, type FC } from "react";

import EntriesSearchResults from "./EntriesSearchResults";

import type { DbSource } from "@/db/db-source";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type {
  CreateEntryWindowParams,
  EntrySearchResult,
  SearchEntries,
} from "@/types/entries";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

/** Max number of search hits returned per request (page size). */
const ENTRIES_SEARCH_LIMIT = 10;

type EntriesSearchProps = {
  dbSource: DbSource;

  /** Restricts the search to this artist's entries; searches all entries when omitted. */
  artistId?: string;

  /** Window-specific search API (must be referentially stable). */
  onSearchEntries: SearchEntries;

  /** Window-specific way of opening an entry. */
  onOpenEntry: (params: Omit<CreateEntryWindowParams, "releaseId">) => void;
};

const EntriesSearch: FC<EntriesSearchProps> = ({
  artistId,
  dbSource,
  onSearchEntries,
  onOpenEntry,
}) => {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [debouncedQuery, isDebouncing] = useDebouncedValue(
    query,
    SEARCH_DEBOUNCE_MS,
  );

  /**
   * Monotonic id for entries search requests. Incremented when clearing the query,
   * dispatching a new search, or unmounting, so responses from older requests are ignored.
   */
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      searchRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    searchRequestIdRef.current += 1;

    if (!debouncedQuery) {
      setEntries([]);
      setNextCursor(null);
      setIsSearching(false);

      return;
    }

    const dispatchedRequestId = searchRequestIdRef.current;

    setIsSearching(true);

    onSearchEntries(
      {
        ...(artistId != null && { artistId }),
        query: debouncedQuery,
        limit: ENTRIES_SEARCH_LIMIT,
      },
      dbSource,
    )
      .then((data) => {
        if (dispatchedRequestId === searchRequestIdRef.current) {
          setEntries(data.items);
          setNextCursor(data.nextCursor);
        }
      })
      .catch((error: unknown) => {
        console.error("Error searching entries", error);

        if (dispatchedRequestId === searchRequestIdRef.current) {
          setEntries([]);
          setNextCursor(null);
        }
      })
      .finally(() => {
        if (dispatchedRequestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      });
  }, [artistId, debouncedQuery, dbSource, onSearchEntries]);

  // within a single artist's entries the artist is already known, so only show names when searching all entries
  const showArtistNames = artistId == null;

  const hasMoreToLoad = nextCursor !== null;

  const loadMore = () => {
    if (!hasMoreToLoad || isLoadingMore || !debouncedQuery) {
      return;
    }

    setIsLoadingMore(true);

    onSearchEntries(
      {
        ...(artistId != null && { artistId }),
        query: debouncedQuery,
        limit: ENTRIES_SEARCH_LIMIT,
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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by entry's name…"
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
        <EntriesSearchResults
          entries={entries}
          onOpenEntry={(entryId) => onOpenEntry({ entryId, source: dbSource })}
          showArtistNames={showArtistNames}
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

export default EntriesSearch;
