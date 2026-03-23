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
  const [isSearching, setIsSearching] = useState(false);

  const artistEntriesSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            setEntries(data);
          }
        })
        .catch((error: unknown) => {
          console.error("Error searching entries", error);

          if (dispatchedRequestId === artistEntriesSearchRequestIdRef.current) {
            setEntries([]);
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
      {trimmedQuery && (
        <ArtistEntriesSearchResults entries={entries} isSearching={isSearching} />
      )}
    </>
  );
};

export default ArtistEntriesSearch;
