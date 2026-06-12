import { useEffect, useRef, useState, type FC } from "react";

import api from "../../api";
import ArtistQueryList from "../ArtistQueryList";

import type { DbSource } from "@/db/db-source";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ArtistQueryResult } from "@/types/artists";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

type ArtistQueryProps = {
  dbSource: DbSource;
};

const ArtistQuery: FC<ArtistQueryProps> = ({ dbSource }) => {
  const [artists, setArtists] = useState<ArtistQueryResult>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [debouncedQuery, isDebouncing] = useDebouncedValue(
    inputValue,
    SEARCH_DEBOUNCE_MS,
  );

  /**
   * Monotonic id for artist search requests. Incremented when clearing the query,
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
      setArtists(null);
      setIsSearching(false);

      return;
    }

    const dispatchedRequestId = searchRequestIdRef.current;

    setIsSearching(true);

    api
      .queryArtists(debouncedQuery, dbSource)
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
          setIsSearching(false);
        }
      });
  }, [debouncedQuery, dbSource]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <h2>Find artist</h2>
      <input value={inputValue} onChange={onChange} />

      {isDebouncing || isSearching ? (
        <div>Loading...</div>
      ) : (
        <ArtistQueryResultView queryResults={artists} dbSource={dbSource} />
      )}
    </>
  );
};

export default ArtistQuery;

const ArtistQueryResultView: FC<{
  queryResults: ArtistQueryResult | null;
  dbSource: DbSource;
}> = ({ queryResults, dbSource }) => {
  if (!queryResults) {
    return null;
  }

  const { directMatches, fuzzyMatches } = queryResults;

  return (
    <>
      <ArtistQueryList artists={directMatches} dbSource={dbSource} />
      {fuzzyMatches.length > 0 && (
        <div className="mt-4">
          <div>{directMatches.length ? "Or did" : "Did"} you mean?</div>
          <ArtistQueryList artists={fuzzyMatches} dbSource={dbSource} />
        </div>
      )}
    </>
  );
};
