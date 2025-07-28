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

      {artists && <ArtistsList artists={artists.substringMatches} />}
    </>
  );
};

export default ArtistQuery;
