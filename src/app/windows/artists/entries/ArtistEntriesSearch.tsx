import { type FC, useEffect, useState } from "react";

import api from "./api";
import ArtistEntriesList from "./ArtistEntriesList";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesSearchProps = {
  artistId: string;
  query: string;
};

const ArtistEntriesSearch: FC<ArtistEntriesSearchProps> = ({
  artistId,
  query,
}) => {
  const [entries, setEntries] = useState<EntrySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setEntries([]);

      return;
    }

    setIsSearching(true);
    api
      .searchArtistEntries({ artistId, query: trimmedQuery })
      .then(setEntries)
      .catch((error: unknown) => {
        console.error("Error searching entries", error);
        setEntries([]);
      })
      .finally(() => setIsSearching(false));
  }, [artistId, query]);

  if (isSearching) {
    return <p>Searching…</p>;
  }

  return <ArtistEntriesList entries={entries} />;
};

export default ArtistEntriesSearch;
