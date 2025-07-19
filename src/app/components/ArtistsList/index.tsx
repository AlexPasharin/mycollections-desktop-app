import { useEffect, useState, type FC } from "react";

import api from "@/api";
import type { FetchArtistsResponse } from "@/types/artists";

type ArtistsState = FetchArtistsResponse & {
  startIndex: number;
};

const ArtistList: FC = () => {
  const [artistsState, setArtistsState] = useState<ArtistsState | null>(null);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingError, setLoadingError] = useState<unknown>(null);

  const fetchArtistsBatch = (direction: "next" | "prev") => {
    setLoadingArtists(true);

    api
      .fetchArtists({
        artistForCompare: artistsState?.[direction] ?? null,
        batchSize: 50,
        direction,
      })
      .then((result) =>
        setArtistsState((prevArtistsState) => ({
          ...result,

          startIndex: prevArtistsState
            ? direction === "next"
              ? prevArtistsState.startIndex +
                prevArtistsState.artists.length -
                1 +
                1
              : prevArtistsState.startIndex - result.artists.length
            : 1,
        })),
      )
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : error;

        console.error(errorMessage);

        setLoadingError(errorMessage);
      })
      .finally(() => setLoadingArtists(false));
  };

  useEffect(() => fetchArtistsBatch("next"), []);

  if (loadingError) {
    return (
      <div>
        Could not load artists:{" "}
        {typeof loadingError === "string" ? loadingError : "Error occurred"}
      </div>
    );
  }

  return (
    <>
      <h2>Artists</h2>
      {artistsState?.prev && (
        <button onClick={() => fetchArtistsBatch("prev")}>
          Prev page &lt;-
        </button>
      )}
      {artistsState?.next && (
        <button onClick={() => fetchArtistsBatch("next")}>
          Next page -&gt;
        </button>
      )}
      {loadingArtists ? (
        <div> Loading artists... </div>
      ) : artistsState ? (
        <ol start={artistsState.startIndex}>
          {artistsState.artists.map(({ artist_id, name }) => (
            <li key={artist_id}>{name}</li>
          ))}
        </ol>
      ) : null}
    </>
  );
};

export default ArtistList;
