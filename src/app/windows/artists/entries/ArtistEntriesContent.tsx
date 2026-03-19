import { type FC, useState } from "react";

import ArtistEntriesSearch from "./ArtistEntriesSearch";

import type { ArtistByIdResult } from "@/types/artists";

type ArtistEntriesContentProps = {
  artist: ArtistByIdResult;
};

const ArtistEntriesContent: FC<ArtistEntriesContentProps> = ({ artist }) => {
  const { artistId, name } = artist;
  const [query, setQuery] = useState("");

  return (
    <div>
      <p>{name}</p>
      <label>
        Search entries
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name…"
        />
      </label>
      <ArtistEntriesSearch artistId={artistId} query={query} />
    </div>
  );
};

export default ArtistEntriesContent;
