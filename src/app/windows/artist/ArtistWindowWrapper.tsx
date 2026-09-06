import { type FC, useCallback, useState } from "react";

import api from "./api";
import ArtistWindowMainContent from "./ArtistWindowMainContent";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import useFetch from "@/hooks/useFetch";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";

const ArtistWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");

  const [primaryDbSource, setPrimaryDbSource] = useState<DbSource>(
    parseDbSource(params.get("source")),
  );

  useSyncSearchParam("source", primaryDbSource);
  useDocumentTitle("Artist View");

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

      {artistId ? (
        <ArtistDataContentWrapper
          artistId={artistId}
          primaryDbSource={primaryDbSource}
        />
      ) : (
        <p>Artist id not provided</p>
      )}
    </div>
  );
};

export default ArtistWindowWrapper;

const ArtistDataContentWrapper: FC<{
  artistId: string;
  primaryDbSource: DbSource;
}> = ({ artistId, primaryDbSource }) => {
  const fetchArtistPromise = useCallback(
    () => api.getArtistById(artistId, primaryDbSource),
    [artistId, primaryDbSource],
  );

  const {
    data: artist,
    setData: setArtist,
    isLoading,
  } = useFetch({
    promise: fetchArtistPromise,
    onError: useCallback(
      (error: unknown) => {
        console.error(`Error getting artist by id (${artistId})`, error);
      },
      [artistId],
    ),
  });

  const title = isLoading
    ? "Artist View - Loading...."
    : artist
      ? `Artist View - ${artist.name}`
      : "Artist View";

  useDocumentTitle(title);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!artist) {
    return <p>Artist not found in database (id: {artistId})</p>;
  }

  return (
    <ArtistWindowMainContent
      artist={artist}
      artistId={artistId}
      primaryDbSource={primaryDbSource}
      onArtistUpdated={setArtist}
    />
  );
};
