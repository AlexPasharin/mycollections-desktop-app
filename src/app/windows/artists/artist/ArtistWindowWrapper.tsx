import { type FC, useEffect, useState } from "react";

import api from "./api";
import ArtistWindowMainContent from "./ArtistWindowMainContent";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";
import type { ArtistByIdResult } from "@/types/artists";

const ArtistWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");

  const [primaryDbSource, setPrimaryDbSource] = useState<DbSource>(
    parseDbSource(params.get("source")),
  );
  const [artist, setArtist] = useState<ArtistByIdResult>();
  const [isLoading, setIsLoading] = useState(true);

  useSyncSearchParam("source", primaryDbSource);

  const title = isLoading
    ? "Artist View - Loading...."
    : artist
      ? `Artist View - ${artist.name}`
      : "Artist View";

  useDocumentTitle(title);

  useEffect(() => {
    if (!artistId) {
      return;
    }

    setIsLoading(true);

    api
      .getArtistById(artistId, primaryDbSource)
      .then(setArtist)
      .catch((error: unknown) => {
        console.error("Error getting artist by id", error);
        setArtist(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [artistId, primaryDbSource]);

  if (!artistId) {
    const error = new Error("artistId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h1 className="m-0">Artist view</h1>
        <DbSourceSelect
          id="artist-db-source"
          value={primaryDbSource}
          onChange={setPrimaryDbSource}
        />
      </header>

      {isLoading ? (
        <p>Loading...</p>
      ) : artist ? (
        <ArtistWindowMainContent
          artist={artist}
          artistId={artistId}
          primaryDbSource={primaryDbSource}
        />
      ) : (
        <p>Artist not found in database</p>
      )}
    </div>
  );
};

export default ArtistWindowWrapper;
