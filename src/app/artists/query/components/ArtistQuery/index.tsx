import { useState, type FC } from "react";

import api from "../../api";
import ArtistsList from "../ArtistsList";

import type { Artist } from "@/prisma/generated";

const ArtistQuery: FC = () => {
  const [artists, setArtists] = useState<Artist[] | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    api
      .queryArtists(value)
      .then(({ exactMatches, substringMatches }) => {
        setArtists([...exactMatches, ...substringMatches]);
      })
      .catch(console.error);
  };

  return (
    <>
      <h2>Find artist</h2>
      <input onChange={onChange} />

      {artists && <ArtistsList artists={artists} />}
    </>
  );
};

export default ArtistQuery;
