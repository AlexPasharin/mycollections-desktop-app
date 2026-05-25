import { useEffect, useRef, useState, type FC } from "react";

import api from "../../api";
import ArtistQueryList from "../ArtistQueryList";

import type { DbSource } from "@/db/db-source";
import type { ArtistQueryResult } from "@/types/artists";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

type ArtistQueryProps = {
  dbSource: DbSource;
};

const ArtistQuery: FC<ArtistQueryProps> = ({ dbSource }) => {
  const [artists, setArtists] = useState<ArtistQueryResult>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Monotonic id for artist search requests. Incremented when clearing the query,
   * dispatching a new search, or unmounting, so responses from older requests are ignored.
   */
  const searchRequestIdRef = useRef(0);

  const clearPendingSearch = () => {
    if (searchTimeoutRef.current !== null) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  };

  const runSearch = (query: string, source: DbSource) => {
    clearPendingSearch();

    searchRequestIdRef.current += 1;

    if (!query) {
      setArtists(null);
      setLoading(false);

      return;
    }

    const dispatchedRequestId = searchRequestIdRef.current;

    setLoading(true);

    api
      .queryArtists(query, source)
      .then((result) => {
        if (dispatchedRequestId === searchRequestIdRef.current) {
          setArtists(result);
        }
      })
      .catch((error: unknown) => {
        console.error(error);

        if (dispatchedRequestId === searchRequestIdRef.current) {
          setArtists(null);
        }
      })
      .finally(() => {
        if (dispatchedRequestId === searchRequestIdRef.current) {
          setLoading(false);
        }
      });
  };

  const scheduleSearch = (query: string, source: DbSource) => {
    clearPendingSearch();

    if (!query) {
      runSearch(query, source);

      return;
    }

    setLoading(true);

    searchTimeoutRef.current = setTimeout(() => {
      runSearch(query, source);
    }, SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => {
    // Unmount-only cleanup
    return () => {
      clearPendingSearch();
      searchRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    // Only react to dbSource; inputValue is read as the current query at switch time.
    runSearch(inputValue, dbSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to dbSource; inputValue is read as current query at switch time
  }, [dbSource]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedValue = e.target.value.trim();

    setInputValue(trimmedValue);
    scheduleSearch(trimmedValue, dbSource);
  };

  return (
    <>
      <h2>Find artist</h2>
      <input value={inputValue} onChange={onChange} />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ArtistQueryResultView queryResults={artists} />
      )}
    </>
  );
};

export default ArtistQuery;

const ArtistQueryResultView: FC<{ queryResults: ArtistQueryResult | null }> = ({
  queryResults,
}) => {
  if (!queryResults) {
    return null;
  }

  const { directMatches, fuzzyMatches } = queryResults;

  return (
    <>
      <ArtistQueryList artists={directMatches} />
      {fuzzyMatches.length > 0 && (
        <div className="mt-4">
          <div>{directMatches.length ? "Or did" : "Did"} you mean?</div>
          <ArtistQueryList artists={fuzzyMatches} />
        </div>
      )}
    </>
  );
};
