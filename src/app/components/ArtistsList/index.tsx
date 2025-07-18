import { useEffect, useState, type FC } from "react";

import api from "@/api";
import type { DBArtist, DBArtistCursor } from "@/types/artists";

type DisplayArtist = { name: string; artist_id: string };

const ArtistList: FC = () => {
  const [artists, setArtists] = useState<DisplayArtist[] | null>(null);
  const [loadingError, setLoadingError] = useState<unknown>(null);

  useEffect(() => {
    getArtists()
      .then(setArtists)
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : error;

        console.error(errorMessage);

        setLoadingError(errorMessage);
      });
  }, []);

  if (loadingError) {
    return (
      <div>
        Could not load artists:{" "}
        {typeof loadingError === "string" ? loadingError : "Error occurred"}
      </div>
    );
  }

  if (!artists) {
    return <div> Loading artists... </div>;
  }

  return (
    <>
      <h2>Artists</h2>
      <ol>
        {artists.map(({ artist_id, name }) => (
          <li key={artist_id}>{name}</li>
        ))}
      </ol>
    </>
  );
};

export default ArtistList;

const getArtists = async () => {
  const artists: DBArtist[] = [];

  let cursor: DBArtistCursor | null = null;

  do {
    const { artists: artistsBatch, next } = await api.fetchArtists({ cursor });

    cursor = next;

    artists.push(...artistsBatch);
  } while (cursor);

  return artists;
};
