import { useCallback, useState, type FC } from "react";

import api from "../../api";
import ArtistQueryList from "../ArtistQueryList";

import type { DbSource } from "@/db/db-source";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import useFetch from "@/hooks/useFetch";
import type { ArtistQueryResult } from "@/types/artists";

/** Wait this long after the last keystroke before calling the API. */
const SEARCH_DEBOUNCE_MS = 400;

type ArtistQueryProps = {
  dbSource: DbSource;
};

const ArtistQuery: FC<ArtistQueryProps> = ({ dbSource }) => {
  // const [artists, setArtists] = useState<ArtistQueryResult>(null);
  const [inputValue, setInputValue] = useState("");

  // const [isSearching, setIsSearching] = useState(false);

  const [debouncedQuery, isDebouncing] = useDebouncedValue(
    inputValue,
    SEARCH_DEBOUNCE_MS,
  );

  const queryArtistsPromise = useCallback(
    () =>
      debouncedQuery
        ? api.queryArtists(debouncedQuery, dbSource)
        : Promise.resolve(null),
    [debouncedQuery, dbSource],
  );

  const { data: artists, isLoading: isSearching } = useFetch({
    promise: queryArtistsPromise,
    onError: useCallback(
      (error) => {
        console.error(
          `Error getting artists by query "${debouncedQuery}"`,
          error,
        );
      },
      [debouncedQuery],
    ),
  });

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
