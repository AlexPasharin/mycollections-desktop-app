import { type FC, useEffect, useState } from "react";

import api from "./api";
import ArtistInfo from "./ArtistEntriesContent/ArtistInfo";
import ArtistEntriesSearch from "./ArtistEntriesSearch";
import styles from "./ArtistWindowWrapper.module.css";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";
import type { ArtistByIdResult } from "@/types/artists";

const ArtistWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");
  const initialDbSource = parseDbSource(params.get("source"));

  const [dbSource, setDbSource] = useState<DbSource>(initialDbSource);
  const [artist, setArtist] = useState<ArtistByIdResult>();
  const [isLoading, setIsLoading] = useState(true);

  useSyncSearchParam("source", dbSource);

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
      .getArtistById(artistId, dbSource)
      .then(setArtist)
      .catch((error: unknown) => {
        console.error("Error getting artist by id", error);
        setArtist(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [artistId, dbSource]);

  if (!artistId) {
    const error = new Error("artistId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Artist view</h1>
        <DbSourceSelect
          id="artist-db-source"
          value={dbSource}
          onChange={setDbSource}
        />
      </header>

      {isLoading ? (
        <p>Loading...</p>
      ) : artist ? (
        <ArtistInfo artist={artist} />
      ) : (
        <p>Artist does not exist</p>
      )}

      <ArtistEntriesSearch
        artistId={artistId}
        dbSource={dbSource}
        loadingArtistData={isLoading}
      />
    </div>
  );
};

export default ArtistWindowWrapper;
