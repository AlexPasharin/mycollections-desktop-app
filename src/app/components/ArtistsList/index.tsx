import { useEffect, useState, type FC } from "react";

import api from "../../../api";
import type { DBArtist } from "../../../types/artists";

type DisplayArtist = { name: string; id: string };

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
        {artists.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ol>
    </>
  );
};

export default ArtistList;

const getArtists = async () => {
  const artists: { name: string; id: string }[] = [];

  let cursor: DBArtist | null = null;

  do {
    const result = await api.fetchArtists({ cursor });
    cursor = result.at(-1) ?? null;

    artists.push(
      ...result.map(({ artist_id, name }) => ({
        id: artist_id,
        name,
      }))
    );
  } while (cursor);

  return artists;
};
