import { useEffect, useState, type FC } from "react";

import api from "../../api";

import ArtistListElement from "@/app/components/Artist";
import type { DbSource } from "@/db/db-source";
import type { FetchArtistsResponse, ListArtist } from "@/types/artists";

type ArtistsState = FetchArtistsResponse & {
  startIndex: number;
};

type AllArtistsListProps = {
  dbSource: DbSource;
};

const AllArtistsList: FC<AllArtistsListProps> = ({ dbSource }) => {
  const [artistsState, setArtistsState] = useState<ArtistsState | null>(null);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingError, setLoadingError] = useState<unknown>(null);

  const fetchArtistsBatch = (
    direction: "next" | "prev",
    artistForCompare?: ListArtist | null,
  ) => {
    setLoadingArtists(true);

    api
      .fetchArtists(
        {
          artistForCompare: artistForCompare ?? null,
          batchSize: 50,
          direction,
        },
        dbSource,
      )
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

  useEffect(() => {
    setArtistsState(null);
    fetchArtistsBatch("next");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to dbSource; reset and fetch first page on DB switch
  }, [dbSource]);

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
      {artistsState?.prev && (
        <button
          type="button"
          onClick={() => fetchArtistsBatch("prev", artistsState.prev)}
        >
          Prev page &lt;-
        </button>
      )}
      {artistsState?.next && (
        <button
          type="button"
          onClick={() => fetchArtistsBatch("next", artistsState.next)}
        >
          Next page -&gt;
        </button>
      )}
      {loadingArtists ? (
        <div> Loading artists... </div>
      ) : artistsState ? (
        <ol start={artistsState.startIndex}>
          {artistsState.artists.map((artist) => (
            <ArtistListElement
              key={artist.artistId}
              artist={artist}
              onArtistSelect={() =>
                api.openNewArtistWindow({
                  artistId: artist.artistId,
                })
              }
            />
          ))}
        </ol>
      ) : null}
    </>
  );
};

export default AllArtistsList;
