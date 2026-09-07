import { useState, type FC } from "react";

import api from "../../api";
import ArtistQueryList from "../ArtistQueryList";

import ErrorMessages from "@/app/components/ErrorMessages";
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
  const [inputValue, setInputValue] = useState("");

  const [debouncedQuery, isDebouncing] = useDebouncedValue(
    inputValue,
    SEARCH_DEBOUNCE_MS,
  );

  const {
    data: artists,
    isLoading: isSearching,
    error: errorFetchingArtists,
  } = useFetch(api.queryArtists, [debouncedQuery, dbSource], {
    skip: !debouncedQuery,
    errorMessage: `Error getting artists by query "${debouncedQuery}"`,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <h2>Find artist</h2>
      <input value={inputValue} onChange={onChange} />

      {isDebouncing || isSearching ? (
        <div className="mt-2">Loading...</div>
      ) : errorFetchingArtists ? (
        <div className="mt-2">
          <ErrorMessages
            id="error-fetching-artists"
            messages={[{ message: "Error fetching artists" }]}
          />
        </div>
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
