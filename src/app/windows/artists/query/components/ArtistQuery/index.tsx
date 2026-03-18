import { useState, type FC } from "react";

import api from "../../api";
import ArtistsList from "../ArtistsList";

import type { ArtistQueryResult } from "@/types/artists";


const ArtistQuery: FC = () => {
  const [artists, setArtists] = useState<ArtistQueryResult>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    api.queryArtists(value).then(setArtists).catch(console.error);
  };

  return (
    <>
      <h2>Find artist</h2>
      <input onChange={onChange} />

      <ArtistQueryResultView queryResults={artists} />
    </>
  );
};

export default ArtistQuery;

const ArtistQueryResultView: FC<{ queryResults: ArtistQueryResult | null }> = ({ queryResults }) => {
  if (!queryResults) {
    return null;
  }

  const { directMatches, fuzzyMatches } = queryResults;

  return (
    <>
      <ArtistsList artists={directMatches} />
      {fuzzyMatches.length > 0 && (
        <div className="mt-4">
          <div>
            {directMatches.length ? "Or did" : "Did"} you mean?
          </div>
          <ArtistsList artists={fuzzyMatches} />
        </div>
      )}
    </>
  );
};

