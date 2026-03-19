import { type FC, useEffect, useState } from "react";

import api from "./api";
import ArtistEntriesContent from "./ArtistEntriesContent";

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
    <div>
      <h1>Artist entries</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : artist ? (
        <ArtistEntriesContent artist={artist} />
      ) : (
        <p>Artist does not exist</p>
      )}
    </div>
  );
};

export default ArtistEntriesWindowWrapper;
