import { type FC, useState } from "react";

import styles from "./ArtistEntriesContent.module.css";

import ArtistEntriesSearch from "../ArtistEntriesSearch";

import type { ArtistByIdResult } from "@/types/artists";

type ArtistEntriesContentProps = {
  artist: ArtistByIdResult;
};

const ArtistEntriesContent: FC<ArtistEntriesContentProps> = ({ artist }) => {
  const { artistId, name, type, partOfQueenFamily } = artist;
  const [query, setQuery] = useState("");

  return (
    <div>
      <p className={styles.artistName}>{name}</p>
      <p>
        {type}
        {partOfQueenFamily && " · Part of Queen family"}
      </p>
      <label>
        <p>Search for artist entries</p>
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
