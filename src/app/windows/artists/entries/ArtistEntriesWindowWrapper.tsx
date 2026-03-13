import { type FC, useEffect, useState } from "react";

import api from "./api";

import type { ArtistByIdResult } from "@/types/artists";

const ArtistEntriesWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");

  const [artist, setArtist] = useState<ArtistByIdResult>();
  const [isLoading, setIsLoading] = useState(true);

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
        <p>{artist.name}</p>
      ) : (
        <p>Artist does not exist</p>
      )}
    </>
  );
};

export default ArtistEntriesWindowWrapper;
