import { useEffect, useState, type FC } from "react";

import api from "../../../api";

type DisplayArtist = { name: string; id: string };

const ArtistList: FC = () => {
  const [artists, setArtists] = useState<DisplayArtist[] | null>(null);
  const [loadingError, setLoadingError] = useState<unknown>(null);

  useEffect(() => {
    api
      .getArtists()
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
      <ul>
        {artists.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
    </>
  );
};

export default ArtistList;
