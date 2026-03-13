import { type FC, useEffect, useState } from "react";

import api from "./api";

import type { ArtistByIdResult } from "@/types/artists";
import type { EntrySearchResult } from "@/types/entries";

const ArtistEntriesWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");

  const [artist, setArtist] = useState<ArtistByIdResult>();
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!artistId) {
      return;
    }

    setIsLoading(true);

    api
      .getArtistById(artistId)
      .then(setArtist)
      .catch((error: unknown) => {
        console.error("Error getting artist by id", error);
        setArtist(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [artistId]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!artistId || trimmedQuery.length < 3) {
      setEntries([]);

      return;
    }

    setIsSearching(true);
    api
      .searchEntriesByArtist({ artistId, query: trimmedQuery })
      .then(setEntries)
      .catch((error: unknown) => {
        console.error("Error searching entries", error);
        setEntries([]);
      })
      .finally(() => setIsSearching(false));
  }, [artistId, query]);

  if (!artistId) {
    const error = new Error("artistId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <>
      <h1>Artist entries</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : artist ? (
        <>
          <p>{artist.name}</p>
          <label>
            Search entries
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name…"
            />
          </label>
          {isSearching && <p>Searching…</p>}
          <ul>
            {entries.map((entry) => (
              <li key={entry.entryId}>{entry.mainName}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>Artist does not exist</p>
      )}
    </>
  );
};

export default ArtistEntriesWindowWrapper;
